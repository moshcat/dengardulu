export type WalkthroughStep = {
  target?: string;
  title_en: string;
  title_bm: string;
  desc_en: string;
  desc_bm: string;
};

export const homepageSteps: WalkthroughStep[] = [
  {
    title_en: 'Welcome to DengarDulu!',
    title_bm: 'Selamat datang di DengarDulu!',
    desc_en: 'Your AI shield against voice scams. Let us show you around.',
    desc_bm: 'Perisai AI anda terhadap penipuan suara. Mari kami tunjukkan.',
  },
  {
    target: '[data-tour="easy-mode"]',
    title_en: 'Easy Mode',
    title_bm: 'Mod Mudah',
    desc_en: 'Tap here to enable Easy Mode — larger text, simpler layout for comfortable reading.',
    desc_bm: 'Tekan sini untuk aktifkan Mod Mudah — teks lebih besar, susun atur lebih ringkas.',
  },
  {
    target: '[data-tour="lang-switch"]',
    title_en: 'Language',
    title_bm: 'Bahasa',
    desc_en: 'Switch between English and Bahasa Melayu here.',
    desc_bm: 'Tukar bahasa Inggeris dan Bahasa Melayu di sini.',
  },
  {
    target: '[data-tour="cta-check"]',
    title_en: 'Start Checking',
    title_bm: 'Mula Semak',
    desc_en: 'Got a suspicious voice note? Tap here to start checking.',
    desc_bm: 'Ada nota suara mencurigakan? Tekan sini untuk mula semak.',
  },
  {
    target: '[data-tour="how-section"]',
    title_en: 'How It Works',
    title_bm: 'Cara Ia Berfungsi',
    desc_en: 'Scroll down to learn how DengarDulu protects you in 3 steps.',
    desc_bm: 'Tatal ke bawah untuk ketahui 3 langkah perlindungan DengarDulu.',
  },
];

export const analyzeSteps: WalkthroughStep[] = [
  {
    target: '[data-tour="dropzone"]',
    title_en: 'Upload Voice Note',
    title_bm: 'Muat Naik Nota Suara',
    desc_en: 'Upload or drag a voice note here. You can also share directly from WhatsApp!',
    desc_bm: 'Muat naik atau seret nota suara di sini. Boleh juga kongsi terus dari WhatsApp!',
  },
  {
    target: '[data-tour="phone-input"]',
    title_en: 'Caller Phone',
    title_bm: 'Nombor Pemanggil',
    desc_en: 'Optionally enter the caller\'s phone number to check scam databases.',
    desc_bm: 'Masukkan nombor pemanggil (pilihan) untuk semak pangkalan data scam.',
  },
  {
    target: '[data-tour="role-selector"]',
    title_en: 'Caller Identity',
    title_bm: 'Identiti Pemanggil',
    desc_en: 'Who did the caller claim to be? This helps our AI detect role-specific scam patterns.',
    desc_bm: 'Siapakah pemanggil mendakwa? Ini membantu AI mengesan corak penipuan mengikut peranan.',
  },
  {
    target: '[data-tour="start-btn"]',
    title_en: 'Start Analysis',
    title_bm: 'Mula Analisis',
    desc_en: 'Once ready, tap here. Results appear in about 15 seconds!',
    desc_bm: 'Bila sedia, tekan sini. Keputusan keluar dalam 15 saat!',
  },
];
