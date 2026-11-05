import { spawn } from 'child_process';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCAL_GEMINI_PORT = 8081;
const LOCAL_GEMINI_URL = `http://127.0.0.1:${LOCAL_GEMINI_PORT}`;
const MODELS_LIST = ['gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-3.5-flash-thinking', 'gemini-flash-lite'];

let pythonProcess = null;

/**
 * Memeriksa apakah server gemini-web2api sudah aktif di port 8081
 */
export const isLocalGeminiAlive = () => {
  return new Promise((resolve) => {
    const req = http.get(`${LOCAL_GEMINI_URL}/v1/models`, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1500, () => {
      req.destroy();
      resolve(false);
    });
  });
};

/**
 * Menjalankan service gemini-web2api secara background
 */
export const startLocalGemini = async () => {
  const alive = await isLocalGeminiAlive();
  if (alive) {
    console.log(`🤖 gemini-web2api sudah berjalan di ${LOCAL_GEMINI_URL}`);
    return true;
  }

  const scriptPath = path.join(__dirname, '..', 'gemini_web2api', 'gemini_web2api.py');
  console.log(`🚀 Menjalankan gemini-web2api dari: ${scriptPath}`);

  try {
    pythonProcess = spawn('python', [scriptPath, '--port', String(LOCAL_GEMINI_PORT)], {
      stdio: 'ignore',
      detached: true,
    });
    pythonProcess.unref();

    // Tunggu server bind port
    for (let i = 0; i < 6; i++) {
      await new Promise((r) => setTimeout(r, 700));
      if (await isLocalGeminiAlive()) {
        console.log(`✅ gemini-web2api siap melayani di ${LOCAL_GEMINI_URL}`);
        return true;
      }
    }
  } catch (err) {
    console.warn(`⚠️ Gagal menjalankan python gemini_web2api:`, err.message);
  }

  return false;
};

/**
 * Menghentikan python process jika spawned oleh node
 */
export const stopLocalGemini = () => {
  if (pythonProcess) {
    try {
      process.kill(pythonProcess.pid);
    } catch {}
    pythonProcess = null;
  }
};

/**
 * Memanggil Gemini API baik melalui gemini-web2api (utama) maupun Google Official API (fallback jika ada API key)
 */
export const callGeminiGenerate = async ({
  contents,
  systemInstruction = null,
  generationConfig = {},
  customApiKey = null,
  preferredModel = 'gemini-3.5-flash',
  timeoutMs = 15000,
}) => {
  // 1. Coba lewat gemini-web2api lokal (bebas kuota & tanpa API key)
  const isAlive = await isLocalGeminiAlive();
  if (isAlive) {
    for (const model of [preferredModel, ...MODELS_LIST.filter((m) => m !== preferredModel)]) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), timeoutMs);

        const payload = {
          contents,
          generationConfig: {
            temperature: generationConfig.temperature ?? 0.7,
            maxOutputTokens: generationConfig.maxOutputTokens ?? 2048,
          },
        };
        if (systemInstruction) {
          payload.systemInstruction = systemInstruction;
        }

        const res = await fetch(`${LOCAL_GEMINI_URL}/v1beta/models/${model}:generateContent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (res.ok) {
          const data = await res.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            return {
              success: true,
              text,
              modelUsed: `${model} (gemini-web2api)`,
              provider: 'gemini-web2api',
            };
          }
        }
      } catch (err) {
        console.warn(`Panggilan gemini-web2api model ${model} gagal:`, err.message);
      }
    }
  }

  return {
    success: false,
    text: null,
    provider: 'none',
  };
};
