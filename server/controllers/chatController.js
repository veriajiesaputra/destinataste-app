import pool from '../config/db.js';
import { callGeminiGenerate } from '../services/geminiService.js';

// Helper fallback itinerary generator jika AI offline
const generateLocalItinerary = (durationNum, travelStyle, budget, destinations) => {
  const getDest = (titlePart) => destinations.find((d) => d.title.toLowerCase().includes(titlePart.toLowerCase()));

  const pian = getDest('pian') || destinations[0];
  const batibul = getDest('batibul') || destinations[1];
  const guci = getDest('guci') || destinations[2];
  const pai = getDest('pantai alam indah') || destinations[3];
  const tauco = getDest('tauco') || destinations[4];
  const tahu = getDest('tahu aci') || destinations[5];
  const cacaban = getDest('cacaban') || destinations[6];
  const semedo = getDest('semedo') || destinations[7];
  const alunAlun = getDest('alun-alun') || destinations[8];
  const muarareja = getDest('muarareja') || destinations[9];
  const lontrong = getDest('lontrong') || destinations[10];

  const days = [];

  // Day 1
  days.push({
    day: 1,
    theme: 'Jelajah Kuliner Legendaris & Suasana Pesisir Kota Tegal',
    schedule: [
      {
        time: '08:00 - 09:30',
        period: 'Pagi',
        activity: 'Sarapan Otentik Legendaris Tegal',
        destinationTitle: pian?.title || 'Nasi Lengko Pi’an',
        destinationId: pian?.id,
        notes: 'Mulai pagi Anda di dekat Stasiun Tegal. Nasi lengko dengan siraman bumbu kacang gurih dan Teh Poci Wasgitel gula batu.',
        estimatedCost: 'Rp 20.000 - Rp 35.000',
      },
      {
        time: '10:00 - 12:00',
        period: 'Siang',
        activity: 'Wisata Bahari & Santai Pesisir',
        destinationTitle: pai?.title || 'Pantai Alam Indah (PAI)',
        destinationId: pai?.id,
        notes: 'Menikmati hembusan angin laut utara, berjalan di dermaga apung, dan berfoto di monumen bahari.',
        estimatedCost: 'Rp 10.000 (Tiket Masuk)',
      },
      {
        time: '12:30 - 14:00',
        period: 'Siang',
        activity: 'Makan Siang Sauto Tauco Khas Tegal',
        destinationTitle: tauco?.title || 'Sauto Tauco Sedap Malam Damoer Asli',
        destinationId: tauco?.id,
        notes: 'Cicipi perpaduan gurih-manis bumbu tauco fermentasi khas Tegal dengan suwiran daging sapi atau jeroan renyah.',
        estimatedCost: 'Rp 30.000 - Rp 45.000',
      },
      {
        time: '15:30 - 17:30',
        period: 'Sore',
        activity: 'Menikmati Senja Pantai Muarareja & Hutan Bakau',
        destinationTitle: muarareja?.title || 'Pantai Muarareja Indah',
        destinationId: muarareja?.id,
        notes: 'Pemandangan matahari terbenam (sunset) yang cantik dipadu deretan warung kelapa muda di tepi pantai.',
        estimatedCost: 'Rp 15.000 - Rp 25.000',
      },
      {
        time: '19:00 - 21:00',
        period: 'Malam',
        activity: 'Makan Malam Sate Kambing Muda Super Empuk',
        destinationTitle: batibul?.title || 'Sate Kambing Muda Batibul Bang Awi',
        destinationId: batibul?.id,
        notes: 'Sate kambing bawah tiga bulan yang bebas bau prengus, sangat empuk disajikan dengan kecap manis pedas dan tomat segar.',
        estimatedCost: 'Rp 50.000 - Rp 80.000',
      },
    ],
  });

  // Day 2
  if (durationNum >= 2) {
    days.push({
      day: 2,
      theme: 'Piknik Sejuk Lereng Gunung Slamet & Pemandian Air Panas',
      schedule: [
        {
          time: '08:00 - 10:00',
          period: 'Pagi',
          activity: 'Perjalanan Menuju Lereng Gunung Slamet & Sarapan',
          destinationTitle: tahu?.title || 'Tahu Aci & Pletok Khas Slawi',
          destinationId: tahu?.id,
          notes: 'Mampir sejenak membeli bekal cemilan Tahu Aci panas yang kenyal gurih sambil menikmati perjalanan ke arah selatan.',
          estimatedCost: 'Rp 20.000',
        },
        {
          time: '10:30 - 14:00',
          period: 'Siang',
          activity: 'Relaksasi Air Panas Alami & Wahana Alam',
          destinationTitle: guci?.title || 'Pemandian Air Panas Guci & The Baron Hill',
          destinationId: guci?.id,
          notes: 'Merasakan khasiat air belerang alami pegunungan yang jernih, dilanjutkan berfoto di jembatan kaca The Baron Hill.',
          estimatedCost: 'Rp 25.000 - Rp 45.000',
        },
        {
          time: '14:30 - 16:30',
          period: 'Sore',
          activity: 'Piknik & Menikmati Udara Danau Perbukitan',
          destinationTitle: cacaban?.title || 'Waduk Cacaban',
          destinationId: cacaban?.id,
          notes: 'Menikmati panorama waduk yang asri dengan latar belakang perbukitan hijau, bisa sewa perahu wisata berkeliling danau.',
          estimatedCost: 'Rp 15.000 - Rp 30.000',
        },
        {
          time: '18:30 - 20:30',
          period: 'Malam',
          activity: 'Suasana Malam Alun-Alun & Minum Es Lontrong',
          destinationTitle: alunAlun?.title || 'Alun-Alun Kota Tegal & Masjid Agung',
          destinationId: alunAlun?.id,
          notes: 'Menikmati gemerlap lampu air mancur menari dan kemegahan Masjid Agung Kota Tegal di malam hari.',
          estimatedCost: 'Rp 10.000 - Rp 25.000',
        },
      ],
    });
  }

  // Day 3
  if (durationNum >= 3) {
    days.push({
      day: 3,
      theme: 'Wisata Edukasi Sejarah Prasejarah & Berburu Oleh-oleh',
      schedule: [
        {
          time: '08:30 - 11:30',
          period: 'Pagi',
          activity: 'Napak Tilas Manusia Purba & Fauna Purba',
          destinationTitle: semedo?.title || 'Museum Situs Semedo',
          destinationId: semedo?.id,
          notes: 'Museum modern spektakuler dengan fosil gajah purba Stegodon dan artefak Homo erectus khas Tegal.',
          estimatedCost: 'Gratis / Donasi',
        },
        {
          time: '12:00 - 13:30',
          period: 'Siang',
          activity: 'Kuliner Legendaris Es Lontrong & Kupat Glabed',
          destinationTitle: lontrong?.title || 'Es Lontrong Slawi',
          destinationId: lontrong?.id,
          notes: 'Mencicipi es legendaris dengan cincau hijau segar dan sirup pandan merah manis yang memanjakan lidah.',
          estimatedCost: 'Rp 10.000 - Rp 20.000',
        },
        {
          time: '14:00 - 16:00',
          period: 'Sore',
          activity: 'Belanja Oleh-Oleh Khas Tegal (Teh Poci, Pilus, Kerupuk Antor)',
          destinationTitle: 'Pusat Oleh-Oleh Khas Tegal (Jalan Veteran & Slawi)',
          destinationId: null,
          notes: 'Membeli poci tanah liat khas Tegal, daun teh melati wangi, dan camilan khas sebelum perjalanan pulang.',
          estimatedCost: 'Sesuai kebutuhan belanja',
        },
      ],
    });
  }

  return {
    title: `Itinerary Eksplorasi Tegal ${durationNum} Hari (${travelStyle})`,
    summary: `Rencana perjalanan terpadu yang dirancang khusus untuk Anda. Menggabungkan kekayaan rasa kuliner khas Tegal dengan keindahan panorama alam dari pantai hingga lereng Gunung Slamet.`,
    duration: `${durationNum} Hari`,
    travelStyle,
    budget,
    estimatedBudgetTotal:
      durationNum === 1
        ? 'Rp 150.000 - Rp 250.000 / orang'
        : durationNum === 2
        ? 'Rp 350.000 - Rp 600.000 / orang'
        : 'Rp 650.000 - Rp 1.100.000 / orang',
    days,
    packingTips: [
      'Bawa jaket atau pakaian hangat terutama jika mengunjungi kawasan Guci dan lereng Gunung Slamet.',
      'Sediakan uang tunai pecahan kecil untuk pembayaran di warung kuliner tradisional dan parkir.',
      'Siapkan kamera atau smartphone dengan baterai penuh untuk mengabadikan momen di sunset Pantai Muarareja atau jembatan kaca Guci.',
      'Kenakan alas kaki atau sandal yang nyaman untuk berjalan di area alam.',
    ],
  };
};

// POST /api/chat
export const chatWithGemini = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Pesan pertanyaan tidak boleh kosong!',
      });
    }

    // 1. Ambil data real destinasi dari MySQL database untuk context grounding
    const [destinations] = await pool.query(
      'SELECT id, title, type, category, rating, price, location, description FROM destinations'
    );

    const destinationsContext = destinations
      .map(
        (d) =>
          `- [ID: ${d.id}] ${d.title} (${d.type} - ${d.category}) | Harga: ${d.price} | Lokasi: ${d.location} | Rating: ★${d.rating} | Deskripsi: ${d.description}`
      )
      .join('\n');

    // Helper: Rekomendasi pintar dari database lokal jika API key kosong atau seluruh endpoint sibuk
    const generateLocalRecommendation = () => {
      const queryLower = message.toLowerCase();
      const matched = destinations.filter(
        (d) =>
          queryLower.includes(d.title.toLowerCase()) ||
          queryLower.includes(d.type.toLowerCase()) ||
          queryLower.includes(d.category.toLowerCase()) ||
          (queryLower.includes('sate') && d.title.toLowerCase().includes('sate')) ||
          (queryLower.includes('alam') && d.type === 'Wisata') ||
          (queryLower.includes('kuliner') && d.type === 'Kuliner') ||
          (queryLower.includes('makan') && d.type === 'Kuliner') ||
          (queryLower.includes('pantai') && d.category.includes('Bahari')) ||
          (queryLower.includes('air') && d.title.toLowerCase().includes('guci'))
      );

      const items = (matched.length > 0 ? matched : destinations.slice(0, 3)).slice(0, 3);
      const text = items
        .map(
          (d) =>
            `• **${d.title}** (${d.type} - ${d.category})\n  📍 *${d.location}* | 🏷️ ${d.price} | ★ ${d.rating}\n  ${d.description}`
        )
        .join('\n\n');

      return {
        reply: `Halo! Saya DestinaTaste AI. 🌴🍲\n\nBerdasarkan data destinasi Tegal kami, berikut rekomendasi terbaik untuk Anda:\n\n${text}\n\nSilakan klik kartu destinasi di bawah untuk melihat detail lengkapnya!`,
        recommendedDestinations: items,
      };
    };

    // 2. Susun prompt untuk Gemini AI
    const systemPrompt = `Anda adalah DestinaTaste AI, asisten pemandu wisata dan kuliner khas Tegal (Kota & Kabupaten Tegal, Jawa Tengah) yang ramah, sopan, antusias, dan berpengetahuan mendalam. Selalu perkenalkan diri Anda sebagai DestinaTaste AI jika ditanya nama atau identitas Anda.
Tugas Anda adalah membantu pengunjung merencanakan liburan, memilih kuliner otentik (seperti Sate Kambing Batibul, Sauto Tauco Sedap Malam, Nasi Lengko Pi'an, Tahu Aci Slawi, Kupat Glabed, Kupat Bongkok, Es Lontrong), atau mengeksplorasi wisata alam & bahari (seperti Pemandian Air Panas Guci lereng Gn. Slamet, Pantai Alam Indah PAI, Pantai Muarareja, Curug Cantel, Waduk Cacaban, Museum Semedo, Alun-Alun Tegal).

Berikut adalah daftar 24 destinasi resmi yang tersedia di database DestinaTaste:
${destinationsContext}

Pedoman menjawab:
1. Rekomendasikan destinasi yang relevan dari daftar di atas sesuai preferensi pengguna (suasana, budget, waktu santap, wisata keluarga vs petualangan).
2. Sebutkan nama destinasi dengan jelas dan sertakan perkiraan tiket/harga serta lokasinya.
3. Berikan saran praktis atau tips berkunjung (misalnya waktu terbaik, rute, atau menu pendamping seperti Teh Poci Wasgitel).
4. Format jawaban dengan rapi menggunakan Markdown (gunakan bullet points, bold, dan emoji yang menarik).
5. Jangan buat data tempat fiktif di luar konteks budaya Tegal.`;

    const contents = [];
    const recentHistory = history.slice(-6);
    for (const h of recentHistory) {
      contents.push({
        role: h.role === 'model' ? 'model' : 'user',
        parts: [{ text: h.text }],
      });
    }
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    // 3. Panggil Gemini AI lewat gemini-web2api
    const geminiResult = await callGeminiGenerate({
      contents,
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: { temperature: 0.7, maxOutputTokens: 1200 },
      preferredModel: 'gemini-3.5-flash',
    });

    if (geminiResult.success && geminiResult.text) {
      const replyText = geminiResult.text;
      const mentionedDestinations = destinations
        .filter((d) => replyText.toLowerCase().includes(d.title.toLowerCase()))
        .slice(0, 3);

      return res.json({
        success: true,
        reply: replyText,
        recommendedDestinations: mentionedDestinations,
        modelUsed: geminiResult.modelUsed,
        provider: geminiResult.provider,
        isFallback: false,
      });
    }

    // 4. Jika gemini-web2api & API eksternal belum merespons, beralih ke fallback cerdas
    console.warn('Beralih ke rekomendasi database lokal');
    const local = generateLocalRecommendation();

    res.json({
      success: true,
      reply: local.reply,
      recommendedDestinations: local.recommendedDestinations,
      isFallback: true,
    });
  } catch (error) {
    console.error('Error chatWithGemini:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghubungi asisten AI: ' + error.message,
    });
  }
};

// POST /api/chat/itinerary - Menghasilkan rencana perjalanan kustom dengan AI
export const generateItinerary = async (req, res) => {
  try {
    const { duration = '1', travelStyle = 'Santai & Kuliner', budget = 'Menengah', preferences = '' } = req.body;

    const durationNum = parseInt(duration, 10) || 1;

    // 1. Ambil data semua destinasi untuk grounding
    const [destinations] = await pool.query(
      'SELECT id, title, type, category, rating, price, location, open_hours FROM destinations'
    );

    const getDestinationZone = (location = '', title = '') => {
      const text = (location + ' ' + title).toLowerCase();
      if (
        text.includes('bumijawa') ||
        text.includes('guci') ||
        text.includes('bojong') ||
        text.includes('cantel') ||
        text.includes('prabalintang') ||
        text.includes('curug putri')
      ) {
        return 'Zona Selatan (Pegunungan Lereng Gn. Slamet - Jarak 40-45 km dari Kota Tegal, waktu tempuh ~1.5 - 2 jam perjalanan)';
      }
      if (text.includes('kedungbanteng') || text.includes('semedo') || text.includes('cacaban')) {
        return 'Zona Timur (Waduk & Situs Bersejarah - Jarak 20-25 km dari Kota Tegal, waktu tempuh ~40-50 menit)';
      }
      if (
        text.includes('talang') ||
        text.includes('adiwerna') ||
        text.includes('slawi') ||
        text.includes('banjaran') ||
        text.includes('pangkah') ||
        text.includes('lontrong') ||
        text.includes('batibul') ||
        text.includes('margasari')
      ) {
        return 'Zona Tengah (Kab. Tegal - Slawi & Adiwerna - Jarak 10-15 km dari Kota Tegal, waktu tempuh ~20-30 menit)';
      }
      return 'Zona Utara (Pusat Kota Tegal & Pesisir Pantura - Akses mudah dekat Stasiun & Pantura)';
    };

    const destSummary = destinations
      .map(
        (d) =>
          `[ID: ${d.id}] ${d.title} | Tipe: ${d.type} (${d.category}) | Harga: ${d.price} | Jam Buka: ${d.open_hours} | Lokasi: ${d.location} | Wilayah: ${getDestinationZone(d.location, d.title)}`
      )
      .join('\n');

    // Helper fallback jika AI offline
    const fallbackPlan = generateLocalItinerary(durationNum, travelStyle, budget, destinations);

    const promptText = `Anda adalah DestinaTaste AI Planner - Asisten Ahli Perencanaan Perjalanan Wisata & Kuliner Tegal (Kota & Kabupaten Tegal).
Buatlah rencana perjalanan ${durationNum} hari di Tegal dengan gaya "${travelStyle}" dan budget "${budget}". Catatan preferensi pengguna: "${preferences || 'Tidak ada catatan khusus'}".

DAFTAR 24 DESTINASI RESMI TEGAL BESERTA ZONASI:
${destSummary}

PANDUAN JARAK, ZONA, & WAKTU TEMPUH (ATURAN SANGAT KETAT - WAJIB DIPATUHI):
1. ATURAN JARAK & ESTIMASI WAKTU TEMPUH:
   - Jarak Kota Tegal / Adiwerna / Slawi (Zona Utara & Tengah) ke kawasan Wisata Guci / Lereng Gn. Slamet (Zona Selatan) adalah 40-45 km jalan menanjak berliku, dengan WAKTU TEMPUH 1.5 HINGGA 2 JAM BERKENDARA.
   - PENGURUTAN JADWAL YANG LOGIS JIKA SATE BATIBUL & GUCI DALAM 1 HARI:
     * OPSI REKOMENDASI UTAMA:
       - 11:30 - 13:00: Makan Siang di Sate Kambing Muda Batibul (Adiwerna / Slawi).
       - (Jeda 13:00 - 14:30 adalah waktu perjalanan berkendara naik ke Guci).
       - 14:30 - 17:30: Relaksasi Pemandian Air Hangat Guci & The Baron Hill (Sore hari adalah momen terbaik di Guci karena udara lereng gunung dingin & berkabut, sangat nikmat untuk berendam air panas!).
     * JIKA GUCI DILAKUKAN PAGI/SIANG (09:30 - 12:30):
       - Jeda (12:30 - 14:00) adalah perjalanan turun ke Slawi.
       - Kartu berikutnya adalah Sate Batibul pada jam 14:00 - 15:30 dengan activity "Makan Siang Sate Kambing Muda Batibul", BUKAN activity "Perjalanan"!

2. ATURAN PENULISAN KARTU DESTINASI (PENTING - JANGAN KELIRU!):
   - KARTU DESTINASI HANYA BERISI KEGIATAN DI TEMPAT TERSEBUT.
   - DILARANG KERAS menulis activity: "Perjalanan..." atau "Menuju..." pada kartu destinasi tempat makan/wisata!
   - Contoh SALAH BESAR: destinationTitle "Sate Kambing Muda Batibul", activity "Perjalanan turun kembali menuju Zona Tengah", time "13:00 - 14:30". (Ini SALAH karena kartu sate malah berisi perjalanan, dan tidak ada waktu makan sate!).
   - Yang BENAR:
     - Jika ada perjalanan jauh sebelumnya (misal dari Guci ke Slawi atau sebaliknya), isi properti "transitBefore" pada item tersebut!
     - time pada kartu adalah WAKTU BERADA DI LOKASI MAKAN/WISATA TERSEBUT.
     - Contoh BENAR:
       {
         "time": "14:15 - 15:30",
         "period": "Siang",
         "transitBefore": "Perjalanan berkendara ~1.5 jam dari kawasan Guci menuju Slawi (12:45 - 14:15)",
         "activity": "Makan Siang Sate Kambing Muda Batibul",
         "destinationTitle": "Sate Kambing Muda Batibul",
         "destinationId": 3,
         "notes": "Menikmati sate kambing bawah tiga bulan yang empuk tanpa prengus dengan cocolan kecap rawit segar.",
         "estimatedCost": "Rp 50.000 - Rp 75.000"
       }

3. DURASI AKTIVITAS HARUS REALISTIS:
   - Makan (sarapan, makan siang, makan malam): 1 - 1.5 jam (JANGAN PERNAH membuat jadwal makan 3-4 jam!).
   - Wisata air hangat Guci: 2.5 - 3.5 jam.
   - Pantai / Museum: 1.5 - 2 jam.

4. Format output HARUS HANYA berupa JSON valid murni (tanpa format markdown tambahan seperti \`\`\`json ... \`\`\`), dengan skema berikut:
{
  "title": "Judul Menarik Rencana Perjalanan",
  "summary": "Ringkasan pengalaman menarik dan rute logis yang akan dinikmati",
  "duration": "${durationNum} Hari",
  "travelStyle": "${travelStyle}",
  "budget": "${budget}",
  "estimatedBudgetTotal": "Rp xxx.xxx - Rp xxx.xxx / orang",
  "days": [
    {
      "day": 1,
      "theme": "Tema Hari Pertama",
      "schedule": [
        {
          "time": "08:00 - 09:30",
          "period": "Pagi",
          "transitBefore": "Info waktu perjalanan dari lokasi sebelumnya (opsional, kosongkan string jika lokasi berdekatan)",
          "activity": "Nama kegiatan di lokasi tersebut (misal: Menikmati Sarapan Nasi Lengko)",
          "destinationTitle": "Nama Destinasi Tegal Terpilih",
          "destinationId": 1,
          "notes": "Tips singkat atau rekomendasi menu",
          "estimatedCost": "Rp 25.000"
        }
      ]
    }
  ],
  "packingTips": ["Tip 1", "Tip 2", "Tip 3"]
}`;

    // Panggil AI lewat gemini-web2api
    const geminiResult = await callGeminiGenerate({
      contents: [{ role: 'user', parts: [{ text: promptText }] }],
      generationConfig: { temperature: 0.6, maxOutputTokens: 2500 },
      preferredModel: 'gemini-3.5-flash',
      timeoutMs: 25000,
    });

    if (geminiResult.success && geminiResult.text) {
      let cleanJson = geminiResult.text.trim();
      if (cleanJson.startsWith('```json')) {
        cleanJson = cleanJson.replace(/^```json/, '').replace(/```$/, '').trim();
      } else if (cleanJson.startsWith('```')) {
        cleanJson = cleanJson.replace(/^```/, '').replace(/```$/, '').trim();
      }

      try {
        const parsed = JSON.parse(cleanJson);
        // Validasi dan lengkapi destinationId jika belum ada
        if (parsed.days && Array.isArray(parsed.days)) {
          parsed.days.forEach((day) => {
            if (day.schedule && Array.isArray(day.schedule)) {
              day.schedule.forEach((item) => {
                if (!item.destinationId && item.destinationTitle) {
                  const match = destinations.find(
                    (d) =>
                      d.title.toLowerCase().includes(item.destinationTitle.toLowerCase()) ||
                      item.destinationTitle.toLowerCase().includes(d.title.toLowerCase())
                  );
                  if (match) item.destinationId = match.id;
                }
              });
            }
          });
        }

        return res.json({
          success: true,
          itinerary: parsed,
          modelUsed: geminiResult.modelUsed,
          provider: geminiResult.provider,
          isFallback: false,
        });
      } catch (jsonErr) {
        console.warn('Gagal parse JSON Gemini:', jsonErr.message);
      }
    }

    // Fallback jika API sedang tidak merespon format yang tepat
    return res.json({
      success: true,
      itinerary: fallbackPlan,
      isFallback: true,
    });
  } catch (error) {
    console.error('Error generateItinerary:', error);
    res.status(500).json({ success: false, message: 'Gagal membuat rencana perjalanan: ' + error.message });
  }
};
