import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: Number(process.env.DB_PORT) || 3306,
};

const DB_NAME = process.env.DB_NAME || 'destinataste_db';

export const INITIAL_CATEGORIES = [
  { slug: 'alam', name: 'Wisata Alam', icon: '🌲', sub: 'Guci, Curug & Danau', type: 'Wisata' },
  { slug: 'bahari', name: 'Wisata Bahari', icon: '🌊', sub: 'Pantai & Pesisir', type: 'Wisata' },
  { slug: 'kuliner', name: 'Kuliner Tradisional', icon: '🍲', sub: 'Sate, Sauto & Glabed', type: 'Kuliner' },
  { slug: 'sejarah', name: 'Wisata Sejarah', icon: '🏛️', sub: 'Situs & Museum', type: 'Wisata' },
  { slug: 'hiburan', name: 'Taman & Hiburan', icon: '🎡', sub: 'Wahana & Rekreasi', type: 'Wisata' },
  { slug: 'oleholeh', name: 'Oleh-Oleh Khas', icon: '🫖', sub: 'Tahu Aci & Latopia', type: 'Kuliner' },
  { slug: 'cafe', name: 'Cafe & Resto', icon: '☕', sub: 'Tempat Santai', type: 'Kuliner' },
];

export const INITIAL_DESTINATIONS = [
  // --- 1. WISATA ALAM & BAHARI & SEJARAH ---
  {
    id: 1,
    title: 'Kawah & Pemandian Air Hangat Guci',
    type: 'Wisata',
    category: 'Wisata Alam',
    rating: 4.8,
    reviews_count: 1420,
    price: 'Rp 20.000 / orang',
    location: 'Desa Guci, Kec. Bumijawa, Kab. Tegal',
    open_hours: '06.00 - 18.00 WIB (Buka Setiap Hari)',
    latitude: -7.1897,
    longitude: 109.1678,
    image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80',
    description: 'Pemandian mata air panas alami dengan udara sejuk pegunungan di lereng Gunung Slamet pada ketinggian 1.050 mdpl. Air panas alami yang jernih dipercaya berkhasiat untuk relaksasi dan kesehatan kulit.',
    facilities: JSON.stringify(['Kolam Rendam Hangat Alami', 'Area Parkir Luas', 'Penginapan & Villa', 'Warung Makan Khas', 'Pancuran 13 & Pancuran 7']),
    is_featured: 1,
  },
  {
    id: 2,
    title: 'Pantai Alam Indah (PAI)',
    type: 'Wisata',
    category: 'Wisata Bahari',
    rating: 4.6,
    reviews_count: 980,
    price: 'Rp 10.000 / orang',
    location: 'Mintaragen, Kec. Tegal Timur, Kota Tegal',
    open_hours: '24 Jam',
    latitude: -6.8524,
    longitude: 109.1415,
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    description: 'Pantai pesisir utara dengan pemandangan ombak tenang dan hutan mangrove, jembatan kayu estetik, serta Monumen Bahari yang edukatif untuk wisata keluarga.',
    facilities: JSON.stringify(['Monumen Bahari', 'Taman Bermain Anak', 'Spot Foto Sunset', 'Gazebo Santai', 'Warung Kuliner Seafood']),
    is_featured: 1,
  },
  {
    id: 6,
    title: 'Waduk Cacaban',
    type: 'Wisata',
    category: 'Wisata Alam',
    rating: 4.5,
    reviews_count: 510,
    price: 'Rp 10.000 / orang',
    location: 'Desa Penujah, Kec. Kedungbanteng, Kab. Tegal',
    open_hours: '07.00 - 17.00 WIB',
    latitude: -7.0084,
    longitude: 109.1995,
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    description: 'Pemandangan danau buatan dengan latar bukit hijau asri, perahu wisata keliling pulau-pulau kecil, spot memancing, dan gardu pandang modern instagramable.',
    facilities: JSON.stringify(['Sewa Perahu Wisata', 'Gardu Pandang', 'Warung Ikan Bakar', 'Taman Bermain', 'Spot Mancing']),
    is_featured: 0,
  },
  {
    id: 8,
    title: 'Curug Cantel Bumijawa',
    type: 'Wisata',
    category: 'Wisata Alam',
    rating: 4.7,
    reviews_count: 430,
    price: 'Rp 10.000 / orang',
    location: 'Desa Sigedong, Kec. Bumijawa, Kab. Tegal',
    open_hours: '08.00 - 16.00 WIB',
    latitude: -7.1950,
    longitude: 109.1780,
    image: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1200&q=80',
    description: 'Air terjun alami tersembunyi dengan ketinggian sekitar 60 meter, dikelilingi tebing hijau rimbun dan gemericik air jernih pegunungan yang sangat dingin dan menyegarkan.',
    facilities: JSON.stringify(['Jalur Tracking Alami', 'Spot Foto Selfie', 'Toilet & Mushola', 'Warung Kopi Hangat']),
    is_featured: 0,
  },
  {
    id: 9,
    title: 'Museum Purbakala Semedo',
    type: 'Wisata',
    category: 'Wisata Sejarah',
    rating: 4.8,
    reviews_count: 540,
    price: 'Rp 5.000 / orang',
    location: 'Desa Semedo, Kec. Kedungbanteng, Kab. Tegal',
    open_hours: '08.30 - 15.30 WIB (Selasa - Minggu)',
    latitude: -7.0421,
    longitude: 109.2315,
    image: 'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?auto=format&fit=crop&w=1200&q=80',
    description: 'Museum cagar budaya purbakala kelas dunia yang memamerkan fosil manusia purba Homo erectus Semedo, gajah purba Stegodon, kudanil purba, dan koleksi kapak batu berumur lebih dari 1,5 juta tahun.',
    facilities: JSON.stringify(['Ruang Diorama Interaktif', 'Bioskop Mini Edukasi', 'Area Parkir Luas', 'Mushola & Toilet', 'Pemandu Khusus']),
    is_featured: 0,
  },
  {
    id: 10,
    title: 'Pantai Muarareja Indah',
    type: 'Wisata',
    category: 'Wisata Bahari',
    rating: 4.6,
    reviews_count: 820,
    price: 'Rp 5.000 / orang',
    location: 'Kel. Muarareja, Kec. Tegal Barat, Kota Tegal',
    open_hours: '06.00 - 18.00 WIB',
    latitude: -6.8488,
    longitude: 109.1120,
    image: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1200&q=80',
    description: 'Pantai asri berpasir hitam halus dengan deretan pohon cemara laut rindang dan hutan mangrove. Sentra kuliner olahan ikan bakar pesisir serta spot menikmati sunset mempesona.',
    facilities: JSON.stringify(['Gazebo Tepi Pantai', 'Sentra Ikan Bakar Pesisir', 'Dermaga Kayu Estetik', 'Perahu Wisata Nelayan']),
    is_featured: 0,
  },
  {
    id: 11,
    title: 'Alun-Alun & Menara Air Heritage Tegal',
    type: 'Wisata',
    category: 'Wisata Sejarah',
    rating: 4.8,
    reviews_count: 1650,
    price: 'Gratis / Bebas Biaya',
    location: 'Mangkukusuman, Tegal Timur, Kota Tegal',
    open_hours: '24 Jam',
    latitude: -6.8677,
    longitude: 109.1378,
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=1200&q=80',
    description: 'Landmark jantung kota Tegal dengan hamparan rumput sintetis, atraksi air mancur menari, megahnya Masjid Agung Kota Tegal, dan Menara Air Kolonial (Waterleiding) peninggalan Belanda tahun 1931.',
    facilities: JSON.stringify(['Rumput Sintetis Luas', 'Air Mancur Menari', 'Masjid Agung Kota Tegal', 'Pusat Wisata Kuliner Malam']),
    is_featured: 1,
  },
  {
    id: 12,
    title: 'Curug Putri Bumijawa',
    type: 'Wisata',
    category: 'Wisata Alam',
    rating: 4.7,
    reviews_count: 390,
    price: 'Rp 7.500 / orang',
    location: 'Dukuh Benda, Desa Benda, Kec. Bumijawa, Kab. Tegal',
    open_hours: '07.00 - 17.00 WIB',
    latitude: -7.2115,
    longitude: 109.1550,
    image: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=1200&q=80',
    description: 'Air terjun alami setinggi 35 meter dengan formasi tebing batu andesit bertingkat eksotis. Berhawa sejuk lereng Gunung Slamet dengan kolam air bening alami untuk berendam.',
    facilities: JSON.stringify(['Jalur Tracking Bambu', 'Kolam Renang Alami', 'Warung Mendoan Panas', 'Spot Foto Estetik']),
    is_featured: 0,
  },
  {
    id: 13,
    title: 'Danau Beko Margasari',
    type: 'Wisata',
    category: 'Wisata Alam',
    rating: 4.5,
    reviews_count: 670,
    price: 'Rp 5.000 / orang',
    location: 'Desa Jatilaba, Kec. Margasari, Kab. Tegal',
    open_hours: '06.00 - 18.00 WIB',
    latitude: -7.0864,
    longitude: 109.0351,
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    description: 'Danau alami berwarna hijau toska eksotis di tengah perbukitan karst kapur putih kapur. Destinasi favorit bagi pecinta fotografi lansekap dan petualangan alam terbuka.',
    facilities: JSON.stringify(['Spot Foto Tebing Karst', 'Area Parkir', 'Warung Kelapa Muda Segar']),
    is_featured: 0,
  },
  {
    id: 14,
    title: 'Rita Park Tegal',
    type: 'Wisata',
    category: 'Taman & Hiburan',
    rating: 4.6,
    reviews_count: 2890,
    price: 'Rp 80.000 (Tiket Terusan)',
    location: 'Jl. Kolonel Sugiono No.155, Pesurungan Kidul, Kota Tegal',
    open_hours: '11.00 - 21.00 WIB',
    latitude: -6.8745,
    longitude: 109.1189,
    image: 'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?auto=format&fit=crop&w=1200&q=80',
    description: 'Taman hiburan tematik terbesar di pesisir Pantura Jawa Tengah dengan lebih dari 25 wahana rekreasi seru seperti Kincir Raksasa (Bianglala 35m), Mini Coaster, Sky Drop, 5D Cinema, dan Rumah Hantu.',
    facilities: JSON.stringify(['25+ Wahana Permainan', 'Food Court & Kafe', 'Area Parkir Super Luas', 'Mushola Ber-AC', 'Toko Suvenir']),
    is_featured: 0,
  },
  {
    id: 15,
    title: 'Wana Wisata Prabalintang Danasari',
    type: 'Wisata',
    category: 'Wisata Alam',
    rating: 4.7,
    reviews_count: 760,
    price: 'Rp 10.000 / orang',
    location: 'Desa Danasari, Kec. Bojong, Kab. Tegal',
    open_hours: '07.00 - 17.00 WIB',
    latitude: -7.1350,
    longitude: 109.1450,
    image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
    description: 'Hutan pinus rindang nan sejuk dengan jembatan gantung kanopi pepohonan, hammock bertingkat warna-warni, ayunan langit, dan area perkemahan (camping ground) di dataran tinggi.',
    facilities: JSON.stringify(['Jembatan Gantung Pinus', 'Camping Ground', 'Wahana Flying Fox', 'Penyewaan Hammock', 'Warung Kopi & Makanan']),
    is_featured: 0,
  },

  // --- 2. KULINER KHAS TEGAL ---
  {
    id: 3,
    title: 'Sate Kambing Muda Batibul',
    type: 'Kuliner',
    category: 'Kuliner Tradisional',
    rating: 4.9,
    reviews_count: 2350,
    price: 'Rp 45.000 / porsi (10 tusuk)',
    location: 'Jl. Raya Tegal - Slawi, Talang & Adiwerna, Kab. Tegal',
    open_hours: '09.00 - 21.00 WIB',
    latitude: -6.9082,
    longitude: 109.1293,
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80',
    description: 'Daging kambing empuk di bawah usia tiga bulan disajikan segar mendesis di atas piring hotplate dengan kecap manis kental, potongan cabai rawit hijau, bawang merah, dan tomat segar.',
    facilities: JSON.stringify(['Ruang Makan Ber-AC & Non-AC', 'Area Parkir', 'Mushola', 'Teh Poci Wasgitel']),
    is_featured: 1,
  },
  {
    id: 4,
    title: 'Tahu Aci Banjaran Slawi',
    type: 'Kuliner',
    category: 'Oleh-Oleh Khas',
    rating: 4.8,
    reviews_count: 870,
    price: 'Rp 15.000 / besek',
    location: 'Banjaran, Slawi, Kab. Tegal',
    open_hours: '08.00 - 20.00 WIB',
    latitude: -6.9855,
    longitude: 109.1382,
    image: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=1200&q=80',
    description: 'Tahu kuning khas potongan segitiga bertekstur lembut dipadu adonan aci berbumbu gurih dan daun kucai wangi, digoreng garing renyah. Sangat mantap dinikmati hangat bersama cabai rawit.',
    facilities: JSON.stringify(['Kemasan Besek Bambu', 'Goreng di Tempat', 'Tahan Perjalanan Luar Kota']),
    is_featured: 1,
  },
  {
    id: 5,
    title: 'Kupat Glabed Ibu Wartini',
    type: 'Kuliner',
    category: 'Kuliner Tradisional',
    rating: 4.7,
    reviews_count: 620,
    price: 'Rp 15.000 / porsi',
    location: 'Kawasan Alun-Alun Kota Tegal',
    open_hours: '16.00 - 22.00 WIB',
    latitude: -6.8681,
    longitude: 109.1385,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80',
    description: 'Kupat berkuah kental kuning gurih ("glabed-glabed") dengan taburan kerupuk mi kenyol, disajikan lengkap dengan sate kerang manis pedas atau sate kikil khas.',
    facilities: JSON.stringify(['Meja Lesehan', 'Sate Kerang & Sate Blengong', 'Kerupuk Antor']),
    is_featured: 1,
  },
  {
    id: 7,
    title: 'Teh Poci Tradisional Wasgitel',
    type: 'Kuliner',
    category: 'Kuliner Tradisional',
    rating: 4.9,
    reviews_count: 730,
    price: 'Rp 8.000 / set poci',
    location: 'Slawi & Alun-Alun Tegal Kota',
    open_hours: '10.00 - 23.00 WIB',
    latitude: -6.9835,
    longitude: 109.1370,
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=1200&q=80',
    description: 'Seduhan teh hijau melati harum dalam wadah poci tanah liat bakar dengan gula batu asli (Wangi, Panas, Sepet, Legi, Kentel / Wasgitel) yang menjadi ikon tradisi minum teh Tegal.',
    facilities: JSON.stringify(['Poci Tanah Liat Khas', 'Gula Batu Asli', 'Camilan Gorengan Hangat']),
    is_featured: 0,
  },
  {
    id: 16,
    title: 'Sauto Tegal Tauco Sedap Malam',
    type: 'Kuliner',
    category: 'Kuliner Tradisional',
    rating: 4.9,
    reviews_count: 3100,
    price: 'Rp 25.000 / porsi',
    location: 'Jl. Raya Talang No.320, Talang, Kab. Tegal',
    open_hours: '08.00 - 22.00 WIB',
    latitude: -6.9150,
    longitude: 109.1320,
    image: 'https://images.unsplash.com/photo-1547928576-a4a33237cbc3?auto=format&fit=crop&w=1200&q=80',
    description: 'Soto khas Tegal ("Sauto") dengan bumbu tauco manis asam gurih aromatik, potongan daging sapi empuk, babat goreng kering kriuk, tauge segar, dan taburan kerupuk mi kuning.',
    facilities: JSON.stringify(['Pilihan Daging / Babat / Ayam', 'Kerupuk Antor & Usus Krispi', 'Ruang Makan Bersih', 'Area Parkir Luas']),
    is_featured: 1,
  },
  {
    id: 17,
    title: 'Sate Blengong & Kupat Glopot Mas Kus',
    type: 'Kuliner',
    category: 'Kuliner Tradisional',
    rating: 4.8,
    reviews_count: 1420,
    price: 'Rp 7.000 / tusuk',
    location: 'Kawasan Alun-Alun Kota Tegal & Kraton',
    open_hours: '15.00 - 23.00 WIB',
    latitude: -6.8670,
    longitude: 109.1360,
    image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=1200&q=80',
    description: 'Sate tusuk panjang berbahan daging blengong (persilangan bebek dan itik manila) yang sangat empuk lembut, dimasak kuah santan cabai kental pedas manis gurih.',
    facilities: JSON.stringify(['Sate Masak & Sate Bakar', 'Kupat Glopot Gurih', 'Teh Poci Wasgitel Asli']),
    is_featured: 0,
  },
  {
    id: 18,
    title: "Nasi Lengko Pi'an Sejak 1926",
    type: 'Kuliner',
    category: 'Kuliner Tradisional',
    rating: 4.9,
    reviews_count: 2850,
    price: 'Rp 16.000 / porsi',
    location: 'Jl. Kolonel Sudiarto No.25 (Dekat Stasiun Tegal), Kota Tegal',
    open_hours: '06.00 - 15.00 WIB',
    latitude: -6.8655,
    longitude: 109.1402,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80',
    description: 'Kuliner legendaris Tegal sejak 1926. Nasi hangat beralas daun pisang dengan irisan tahu tempe goreng renyah, tauge rebus, timun, daun kucai segar, dan siraman bumbu kacang pekat harum.',
    facilities: JSON.stringify(['Sate Kambing Pendamping', 'Tahu Pletok Renyah', 'Nuansa Kedai Tempo Dulu', 'Dekat Stasiun Kereta Api']),
    is_featured: 1,
  },
  {
    id: 19,
    title: 'Kupat Bongkok Ibu Rokhyati',
    type: 'Kuliner',
    category: 'Kuliner Tradisional',
    rating: 4.7,
    reviews_count: 560,
    price: 'Rp 12.000 / porsi',
    location: 'Desa Bongkok, Kec. Kramat & Pasar Pagi Kota Tegal',
    open_hours: '06.00 - 12.00 WIB',
    latitude: -6.8610,
    longitude: 109.1720,
    image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=1200&q=80',
    description: 'Kupat khas Desa Bongkok dengan siraman kuah kari tempe semangit (tempe fermentasi khas Tegal) pedas gurih, dilengkapi mi kenyol kenyal dan taburan remahan kerupuk antor gurih.',
    facilities: JSON.stringify(['Menu Sarapan Khas', 'Gorengan Tempe Mendoan Panas', 'Sambal Rawit Ulek']),
    is_featured: 0,
  },
  {
    id: 20,
    title: 'Pia Ny. Siem / Latopia Khas Tegal',
    type: 'Kuliner',
    category: 'Oleh-Oleh Khas',
    rating: 4.8,
    reviews_count: 1190,
    price: 'Rp 35.000 / kotak (isi 10)',
    location: 'Jl. Veteran No.28, Tegalsari, Kota Tegal',
    open_hours: '08.00 - 21.00 WIB',
    latitude: -6.8625,
    longitude: 109.1340,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80',
    description: 'Oleh-oleh pia kering kotak legendaris khas Tegal dengan kulit pastry berlapis garing renyah dan isian tebal legit: kacang hijau kupas, cokelat lumer, keju, durian, dan nanas.',
    facilities: JSON.stringify(['Fresh dari Oven', 'Kemasan Kotak Cantik', 'Tahan Hingga 3 Minggu', 'Bisa Cicip Tester']),
    is_featured: 0,
  },
  {
    id: 21,
    title: 'Kacang Bogares Asli Renyah',
    type: 'Kuliner',
    category: 'Oleh-Oleh Khas',
    rating: 4.8,
    reviews_count: 940,
    price: 'Rp 28.000 / bungkus (500gr)',
    location: 'Sentra Bogares Kidul, Kec. Pangkah, Kab. Tegal',
    open_hours: '08.00 - 20.00 WIB',
    latitude: -6.9740,
    longitude: 109.1650,
    image: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=1200&q=80',
    description: 'Kacang tanah pilihan khas desa Bogares yang disangrai dengan media pasir sungai bersih tanpa minyak goreng, beraroma bawang putih gurih alami dan bertekstur sangat renyah tahan lama.',
    facilities: JSON.stringify(['Sangrai Pasir Tradisional', 'Kemasan Vakum Higienis', 'Pilihan Rasa Bawang & Asin']),
    is_featured: 0,
  },
  {
    id: 22,
    title: 'Es Lontrong Slawi Legendaris',
    type: 'Kuliner',
    category: 'Kuliner Tradisional',
    rating: 4.9,
    reviews_count: 1530,
    price: 'Rp 7.000 / porsi',
    location: 'Gang Lontrong No.5, Slawi Kulon, Tegal',
    open_hours: '09.00 - 16.30 WIB',
    latitude: -6.9820,
    longitude: 109.1365,
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=1200&q=80',
    description: 'Minuman es legendaris di gang sempit (lontrong) kota Slawi sejak 1970-an. Berisi cincau hijau alami kenyal, bubur kacang hijau empuk, santan gurih, es serut, dan sirup merah gula asli.',
    facilities: JSON.stringify(['Resep Warisan Sejak 1970-an', 'Es Serut Dingin Segar', 'Camilan Gorengan & Kerupuk']),
    is_featured: 0,
  },
  {
    id: 23,
    title: 'Tahu Pletok Khas Slawi',
    type: 'Kuliner',
    category: 'Oleh-Oleh Khas',
    rating: 4.8,
    reviews_count: 890,
    price: 'Rp 15.000 / besek',
    location: 'Banjaran & Trayeman, Slawi, Kab. Tegal',
    open_hours: '09.00 - 21.00 WIB',
    latitude: -6.9860,
    longitude: 109.1380,
    image: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=1200&q=80',
    description: 'Variasi tahu aci khas Tegal yang dibelah melebar ("diplethok") lalu dibalur adonan aci gurih dengan irisan daun bawang melimpah, digoreng garing renyah hingga sensasi kriuknya maksimal.',
    facilities: JSON.stringify(['Goreng Panas Mendadak', 'Bumbu Kecap Cabai Rawit', 'Besek Bambu Tradisional']),
    is_featured: 0,
  },
  {
    id: 24,
    title: 'Warteg Waroeng Ibu Hj. Maryam Tegal',
    type: 'Kuliner',
    category: 'Kuliner Tradisional',
    rating: 4.7,
    reviews_count: 1120,
    price: 'Rp 15.000 - Rp 25.000 / porsi',
    location: 'Jl. Gajah Mada No.88, Kota Tegal',
    open_hours: '24 Jam Nonstop',
    latitude: -6.8710,
    longitude: 109.1315,
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
    description: 'Menikmati kuliner Warteg langsung dari kampung halamannya di Tegal. Menampilkan lebih dari 30 etalase lauk rumahan: orek tempe basah legit, telur puyuh balado, cumi asin cabai hijau, sayur lodeh, dan oseng kerang.',
    facilities: JSON.stringify(['30+ Variasi Lauk Rumahan', 'Buka 24 Jam Nonstop', 'Tempat Nyaman Bersih', 'Teh Tawar Hangat Gratis']),
    is_featured: 0,
  },
];

export async function initializeDatabase(forceRefresh = false) {
  let connection;
  try {
    console.log('🔄 Menghubungkan ke MySQL Server...');
    connection = await mysql.createConnection(DB_CONFIG);

    console.log(`📦 Memastikan database "${DB_NAME}" siap...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.query(`USE \`${DB_NAME}\`;`);

    // 1. TABEL USERS
    console.log('📋 Menyiapkan tabel `users`...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`name\` VARCHAR(100) NOT NULL,
        \`email\` VARCHAR(100) NOT NULL UNIQUE,
        \`password\` VARCHAR(255) NOT NULL,
        \`role\` ENUM('pengguna', 'admin') NOT NULL DEFAULT 'pengguna',
        \`avatar\` TEXT DEFAULT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 2. TABEL CATEGORIES
    console.log('📋 Menyiapkan tabel `categories`...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`categories\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`slug\` VARCHAR(50) NOT NULL UNIQUE,
        \`name\` VARCHAR(100) NOT NULL,
        \`icon\` VARCHAR(20) NOT NULL,
        \`sub\` VARCHAR(100) NOT NULL,
        \`type\` ENUM('Wisata', 'Kuliner') NOT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 3. TABEL DESTINATIONS (Dengan koordinat latitude & longitude untuk peta)
    console.log('📋 Menyiapkan tabel `destinations`...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`destinations\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`title\` VARCHAR(255) NOT NULL,
        \`type\` ENUM('Wisata', 'Kuliner') NOT NULL,
        \`category\` VARCHAR(100) NOT NULL,
        \`rating\` DECIMAL(2,1) NOT NULL DEFAULT 4.5,
        \`reviews_count\` INT NOT NULL DEFAULT 0,
        \`price\` VARCHAR(100) NOT NULL,
        \`location\` VARCHAR(255) NOT NULL,
        \`open_hours\` VARCHAR(100) DEFAULT NULL,
        \`latitude\` DECIMAL(10, 7) DEFAULT NULL,
        \`longitude\` DECIMAL(10, 7) DEFAULT NULL,
        \`image\` TEXT NOT NULL,
        \`description\` TEXT NOT NULL,
        \`facilities\` JSON DEFAULT NULL,
        \`is_featured\` BOOLEAN NOT NULL DEFAULT 0,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Pastikan kolom latitude & longitude ada jika tabel sudah ada sebelumnya
    try {
      await connection.query('ALTER TABLE `destinations` ADD COLUMN `latitude` DECIMAL(10, 7) DEFAULT NULL AFTER `open_hours`');
    } catch (_) {}
    try {
      await connection.query('ALTER TABLE `destinations` ADD COLUMN `longitude` DECIMAL(10, 7) DEFAULT NULL AFTER `latitude`');
    } catch (_) {}

    // 4. TABEL REVIEWS (Dengan photo_url)
    console.log('📋 Menyiapkan tabel `reviews`...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`reviews\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`destination_id\` INT NOT NULL,
        \`user_id\` INT NOT NULL,
        \`rating\` INT NOT NULL,
        \`comment\` TEXT NOT NULL,
        \`photo_url\` TEXT DEFAULT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT \`fk_reviews_destination\` FOREIGN KEY (\`destination_id\`) REFERENCES \`destinations\`(\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`fk_reviews_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    try {
      await connection.query('ALTER TABLE `reviews` ADD COLUMN `photo_url` TEXT DEFAULT NULL AFTER `comment`');
    } catch (_) {}

    // 5. TABEL FAVORITES (Fitur Wishlist Pengguna)
    console.log('📋 Menyiapkan tabel `favorites`...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`favorites\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`user_id\` INT NOT NULL,
        \`destination_id\` INT NOT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY \`uq_user_destination\` (\`user_id\`, \`destination_id\`),
        CONSTRAINT \`fk_favorites_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`fk_favorites_destination\` FOREIGN KEY (\`destination_id\`) REFERENCES \`destinations\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // SEED DEFAULT USERS (Admin & Pengguna)
    console.log('🌱 Menyinkronkan data akun default...');
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const hashedUserPassword = await bcrypt.hash('user123', 10);

    // Akun Admin
    await connection.query(`
      INSERT INTO \`users\` (\`name\`, \`email\`, \`password\`, \`role\`, \`avatar\`) 
      VALUES (?, ?, ?, 'admin', ?)
      ON DUPLICATE KEY UPDATE \`name\` = VALUES(\`name\`), \`role\` = 'admin'
    `, ['Admin DestinaTaste', 'admin@destinataste.com', hashedAdminPassword, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80']);

    // Akun Pengguna 1
    await connection.query(`
      INSERT INTO \`users\` (\`name\`, \`email\`, \`password\`, \`role\`, \`avatar\`) 
      VALUES (?, ?, ?, 'pengguna', ?)
      ON DUPLICATE KEY UPDATE \`name\` = VALUES(\`name\`), \`role\` = 'pengguna'
    `, ['Budi Santoso', 'budi@gmail.com', hashedUserPassword, 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80']);

    // Akun Pengguna 2
    await connection.query(`
      INSERT INTO \`users\` (\`name\`, \`email\`, \`password\`, \`role\`, \`avatar\`) 
      VALUES (?, ?, ?, 'pengguna', ?)
      ON DUPLICATE KEY UPDATE \`name\` = VALUES(\`name\`), \`role\` = 'pengguna'
    `, ['Siti Rahma', 'siti@gmail.com', hashedUserPassword, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80']);

    // SEED CATEGORIES
    console.log('🌱 Menyinkronkan data kategori...');
    for (const cat of INITIAL_CATEGORIES) {
      await connection.query(
        `INSERT INTO \`categories\` (\`slug\`, \`name\`, \`icon\`, \`sub\`, \`type\`) 
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE \`name\` = VALUES(\`name\`), \`icon\` = VALUES(\`icon\`), \`sub\` = VALUES(\`sub\`), \`type\` = VALUES(\`type\`)`,
        [cat.slug, cat.name, cat.icon, cat.sub, cat.type]
      );
    }

    // SEED DESTINATIONS (Termasuk latitude & longitude)
    console.log('🌱 Menyinkronkan data 24 destinasi wisata & kuliner khas Tegal...');
    for (const dest of INITIAL_DESTINATIONS) {
      await connection.query(
        `INSERT INTO \`destinations\` 
          (\`id\`, \`title\`, \`type\`, \`category\`, \`rating\`, \`reviews_count\`, \`price\`, \`location\`, \`open_hours\`, \`latitude\`, \`longitude\`, \`image\`, \`description\`, \`facilities\`, \`is_featured\`) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
          \`title\` = VALUES(\`title\`),
          \`type\` = VALUES(\`type\`),
          \`category\` = VALUES(\`category\`),
          \`rating\` = VALUES(\`rating\`),
          \`reviews_count\` = VALUES(\`reviews_count\`),
          \`price\` = VALUES(\`price\`),
          \`location\` = VALUES(\`location\`),
          \`open_hours\` = VALUES(\`open_hours\`),
          \`latitude\` = VALUES(\`latitude\`),
          \`longitude\` = VALUES(\`longitude\`),
          \`image\` = VALUES(\`image\`),
          \`description\` = VALUES(\`description\`),
          \`facilities\` = VALUES(\`facilities\`),
          \`is_featured\` = VALUES(\`is_featured\`)`,
        [
          dest.id,
          dest.title,
          dest.type,
          dest.category,
          dest.rating,
          dest.reviews_count,
          dest.price,
          dest.location,
          dest.open_hours,
          dest.latitude,
          dest.longitude,
          dest.image,
          dest.description,
          dest.facilities,
          dest.is_featured,
        ]
      );
    }

    // SEED SAMPLE REVIEWS DENGAN FOTO
    const [existingReviews] = await connection.query('SELECT COUNT(*) as count FROM `reviews`');
    if (existingReviews[0].count === 0) {
      console.log('🌱 Melakukan seeding ulasan awal dari pengguna...');
      const [users] = await connection.query('SELECT id, email FROM users');
      const budi = users.find(u => u.email === 'budi@gmail.com');
      const siti = users.find(u => u.email === 'siti@gmail.com');

      if (budi && siti) {
        const sampleReviews = [
          { destId: 1, userId: budi.id, rating: 5, comment: 'Air panasnya alami banget dan udara lereng Gunung Slamet sejuk menyegarkan. Wajib ke Pancuran 13!', photoUrl: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=600&q=80' },
          { destId: 1, userId: siti.id, rating: 5, comment: 'Sangat cocok untuk liburan keluarga, pemandian air hangatnya bikin rileks pegal-pegal langsung hilang.', photoUrl: null },
          { destId: 3, userId: budi.id, rating: 5, comment: 'Sate batibulnya beneran empuk tanpa lemak, disajikan di hotplate dengan cabe rawit dan kecap pedas nikmat!', photoUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80' },
          { destId: 4, userId: siti.id, rating: 5, comment: 'Tahu acinya renyah di luar, lembut di dalam. Wajib beli satu besek buat oleh-oleh pulang ke rumah.', photoUrl: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=600&q=80' },
          { destId: 16, userId: budi.id, rating: 5, comment: 'Sauto Tegal dengan tauco sedap malam ini cita rasanya otentik. Babat gorengnya garing dan gurih pol!', photoUrl: null },
        ];

        for (const rev of sampleReviews) {
          await connection.query(
            'INSERT INTO `reviews` (`destination_id`, `user_id`, `rating`, `comment`, `photo_url`) VALUES (?, ?, ?, ?, ?)',
            [rev.destId, rev.userId, rev.rating, rev.comment, rev.photoUrl]
          );
        }
      }
    }

    // SEED SAMPLE FAVORITES UNTUK BUDI
    const [existingFavs] = await connection.query('SELECT COUNT(*) as count FROM `favorites`');
    if (existingFavs[0].count === 0) {
      const [users] = await connection.query('SELECT id, email FROM users');
      const budi = users.find(u => u.email === 'budi@gmail.com');
      if (budi) {
        await connection.query('INSERT IGNORE INTO `favorites` (`user_id`, `destination_id`) VALUES (?, 1), (?, 3), (?, 4)', [budi.id, budi.id, budi.id]);
      }
    }

    console.log('🎉 Database DestinaTaste siap dengan seluruh fitur lanjutan!');
  } catch (error) {
    console.error('❌ Gagal menginisialisasi database:', error);
    throw error;
  } finally {
    if (connection) await connection.end();
  }
}

// Jalankan jika dipanggil dari terminal
if (process.argv[1]?.endsWith('initDb.js')) {
  initializeDatabase(true)
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
