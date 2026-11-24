import type { LanguageCode } from '../types/tapfx';

export interface TranslationBundle {
  nav: {
    home: string;
    generator: string;
    multiLink: string;
    nfcCards: string;
    products: string;
    pricing: string;
    login: string;
    signup: string;
    getStarted: string;
    dashboard: string;
  };
  hero: {
    kicker: string;
    headline: string;
    subheadline: string;
    primaryCta: string;
    secondaryCta: string;
    tapToPreview: string;
    qrMode: string;
    nfcMode: string;
    liveScanToast: string;
  };
  sections: {
    featuresTitle: string;
    featuresSubtitle: string;
    multiLinkTitle: string;
    multiLinkSubtitle: string;
    multiLinkCta: string;
    productsTitle: string;
    productsSubtitle: string;
    howItWorksTitle: string;
    analyticsTitle: string;
    pricingTitle: string;
    useCasesTitle: string;
    testimonialsTitle: string;
    testimonialsNote: string;
    faqTitle: string;
  };
  reviewPage: {
    reviewButton: string;
    needHelp: string;
    tellPrivately: string;
    aiDisclosure: string;
    pickRating: string;
    pickTags: string;
    optionalNote: string;
    generateDrafts: string;
    copyAndOpen: string;
    copiedNotice: string;
    needMoreDetails: string;
    privateFeedbackTitle: string;
    privateFeedbackHint: string;
    sendFeedback: string;
    feedbackSent: string;
    poweredBy: string;
    followUs: string;
  };
  orderFlow: {
    title: string;
    subtitle: string;
    stepProduct: string;
    stepDetails: string;
    stepShipping: string;
    payUpi: string;
    payCard: string;
    orderWhatsapp: string;
    placeOrder: string;
    trackOrder: string;
  };
  footer: {
    tagline: string;
    platform: string;
    products: string;
    company: string;
    legal: string;
    contactLine: string;
    copyright: string;
  };
}

export const TRANSLATIONS: Record<LanguageCode, TranslationBundle> = {
  en: {
    nav: {
      home: 'Home',
      generator: 'QR Generator',
      multiLink: 'Multi-Link Pages',
      nfcCards: 'NFC Cards',
      products: 'Products',
      pricing: 'Pricing',
      login: 'Login',
      signup: 'Sign Up',
      getStarted: 'Get Started Free',
      dashboard: 'Dashboard',
    },
    hero: {
      kicker: 'TapFX Platform · Dynamic QR, NFC Hardware & Review Intelligence',
      headline: 'One QR. Endless Possibilities.',
      subheadline:
        'Create dynamic QR codes, multi-link digital profiles, and NFC review cards that turn everyday customer visits into lasting Google reviews and measurable engagement.',
      primaryCta: 'Start Creating',
      secondaryCta: 'Explore TapFX Cards',
      tapToPreview: 'Live Tap & Scan Simulation',
      qrMode: 'QR Scan',
      nfcMode: 'NFC Tap',
      liveScanToast: 'Scan logged · Kalinga Spice Bistro · Review page opened in 120ms',
    },
    sections: {
      featuresTitle: 'Everything You Need. One Platform.',
      featuresSubtitle:
        'Built for local businesses, clinics, restaurants, retail shops, and professionals who need reliable QR and NFC infrastructure.',
      multiLinkTitle: 'One Link. Your Entire Business.',
      multiLinkSubtitle:
        'Combine your WhatsApp ordering, Google Reviews, menu, Instagram, location, and contact details on one mobile-first page. Update links anytime without reprinting a single card.',
      multiLinkCta: 'Create Your Digital Profile',
      productsTitle: 'Meet the TapFX NFC Collection.',
      productsSubtitle:
        'Precision-crafted PVC, anodized metal, and countertop acrylic hardware pre-linked to your dynamic TapFX destinations.',
      howItWorksTitle: 'From Setup to First Tap in Minutes',
      analyticsTitle: 'Clear Scan & Review Analytics',
      pricingTitle: 'Transparent Plans That Scale With You',
      useCasesTitle: 'Built for Every Local Business & Professional',
      testimonialsTitle: 'How Businesses Use TapFX',
      testimonialsNote: 'Sample demonstration profiles illustrating typical business workflows.',
      faqTitle: 'Frequently Asked Questions',
    },
    reviewPage: {
      reviewButton: 'Review us on Google',
      needHelp: 'Need help wording it?',
      tellPrivately: 'Tell the shop privately',
      aiDisclosure: 'AI helped word this. Write only what you experienced.',
      pickRating: 'How was your visit?',
      pickTags: 'Tap what stood out',
      optionalNote: 'Add a quick note (optional)',
      generateDrafts: 'Suggest Wording',
      copyAndOpen: 'Copy & Open Google',
      copiedNotice: 'Copied to clipboard — paste inside Google Reviews.',
      needMoreDetails: 'Tell us one thing you noticed.',
      privateFeedbackTitle: 'Share feedback directly with the owner',
      privateFeedbackHint: 'Your message goes privately to the shop team. You can still post on Google anytime.',
      sendFeedback: 'Send Private Note',
      feedbackSent: 'Thank you — your note has been shared with the shop owner.',
      poweredBy: 'Powered by TapFX',
      followUs: 'Connect with us',
    },
    orderFlow: {
      title: 'Customize & Order TapFX Hardware',
      subtitle: 'Preview your front and back design proof live before confirming your order.',
      stepProduct: '1. Select Product & Quantity',
      stepDetails: '2. Brand Details & Destination',
      stepShipping: '3. Proof Approval & Payment',
      payUpi: 'Pay via UPI (Instant)',
      payCard: 'Debit / Credit Card',
      orderWhatsapp: 'Order on WhatsApp',
      placeOrder: 'Confirm & Place Order',
      trackOrder: 'Track Order Status',
    },
    footer: {
      tagline: 'One Tap. Endless Possibilities.',
      platform: 'Platform',
      products: 'Products',
      company: 'Company',
      legal: 'Legal',
      contactLine: 'WhatsApp +91 96922 99405 · tapfxx@gmail.com · @tap.fx',
      copyright: '© 2026 TapFX. All rights reserved.',
    },
  },
  od: {
    nav: {
      home: 'ହୋମ୍',
      generator: 'QR ଜେନେରେଟର୍',
      multiLink: 'ମଲ୍ଟି-ଲିଙ୍କ୍ ପେଜ୍',
      nfcCards: 'NFC କାର୍ଡ୍',
      products: 'ପ୍ରଡକ୍ଟସ୍',
      pricing: 'ମୂଲ୍ୟ ତାଲିକା',
      login: 'ଲଗଇନ୍',
      signup: 'ସାଇନ୍ ଅପ୍',
      getStarted: 'ମାଗଣାରେ ଆରମ୍ଭ କରନ୍ତୁ',
      dashboard: 'ଡ୍ୟାସବୋର୍ଡ',
    },
    hero: {
      kicker: 'TapFX ପ୍ଲାଟଫର୍ମ · ଡାଇନାମିକ୍ QR, NFC କାର୍ଡ୍ ଏବଂ Google ରିଭ୍ୟୁ',
      headline: 'ଗୋଟିଏ QR. ଅସୀମ ସମ୍ଭାବନା।',
      subheadline:
        'ଗୋଟିଏ ପ୍ଲାଟଫର୍ମରୁ ଡାଇନାମିକ୍ QR କୋଡ୍, ଡିଜିଟାଲ୍ ବିଜନେସ୍ ପ୍ରୋଫାଇଲ୍ ଏବଂ NFC ରିଭ୍ୟୁ କାର୍ଡ୍ ତିଆରି ଓ ପରିଚାଳନା କରନ୍ତୁ।',
      primaryCta: 'ଆରମ୍ଭ କରନ୍ତୁ',
      secondaryCta: 'TapFX କାର୍ଡ୍ ଦେଖନ୍ତୁ',
      tapToPreview: 'ଲାଇଭ୍ ଟ୍ୟାପ୍ ଓ ସ୍କାନ୍ ଡେମୋ',
      qrMode: 'QR ସ୍କାନ୍',
      nfcMode: 'NFC ଟ୍ୟାପ୍',
      liveScanToast: 'ସ୍କାନ୍ ରେକର୍ଡ ହେଲା · କଳିଙ୍ଗ ସ୍ପାଇସ୍ ବିଷ୍ଟ୍ରୋ · ରିଭ୍ୟୁ ପେଜ୍ ଖୋଲିଲା',
    },
    sections: {
      featuresTitle: 'ଆପଣଙ୍କ ବ୍ୟବସାୟ ପାଇଁ ସମ୍ପୂର୍ଣ୍ଣ ସମାଧାନ।',
      featuresSubtitle:
        'ଦୋକାନ, ରେଷ୍ଟୁରାଣ୍ଟ, ଫାର୍ମାସି, ହୋଟେଲ ଏବଂ ବୃତ୍ତିଗତମାନଙ୍କ ପାଇଁ ନିର୍ମିତ ସ୍ମାର୍ଟ QR ଏବଂ NFC ପ୍ଲାଟଫର୍ମ।',
      multiLinkTitle: 'ଗୋଟିଏ ଲିଙ୍କ୍। ସମ୍ପୂର୍ଣ୍ଣ ବ୍ୟବସାୟ।',
      multiLinkSubtitle:
        'WhatsApp ଅର୍ଡର୍, Google ରିଭ୍ୟୁ, ମେନୁ, Instagram ଏବଂ ଲୋକେସନ୍ ଗୋଟିଏ ପେଜରେ ରଖନ୍ତୁ। କାର୍ଡ୍ ନ ବଦଳାଇ ଯେକୌଣସି ସମୟରେ ଲିଙ୍କ୍ ଅପଡେଟ୍ କରନ୍ତୁ।',
      multiLinkCta: 'ଡିଜିଟାଲ୍ ପ୍ରୋଫାଇଲ୍ ତିଆରି କରନ୍ତୁ',
      productsTitle: 'TapFX NFC କଲେକ୍ସନ୍ ଦେଖନ୍ତୁ।',
      productsSubtitle: 'ଉଚ୍ଚମାନର NFC କାର୍ଡ୍ ଏବଂ ଆକ୍ରିଲିକ୍ QR ଷ୍ଟାଣ୍ଡ୍, ଆପଣଙ୍କ ଦୋକାନର ବ୍ରାଣ୍ଡିଂ ସହିତ।',
      howItWorksTitle: 'ମାତ୍ର କିଛି ମିନିଟରେ ଆରମ୍ଭ କରନ୍ତୁ',
      analyticsTitle: 'ସ୍କାନ୍ ଏବଂ ରିଭ୍ୟୁ ଆନାଲିଟିକ୍ସ',
      pricingTitle: 'ସହଜ ଓ ସ୍ପଷ୍ଟ ପ୍ଲାନ୍',
      useCasesTitle: 'ପ୍ରତ୍ୟେକ ବ୍ୟବସାୟ ପାଇଁ ଉପଯୋଗୀ',
      testimonialsTitle: 'ବ୍ୟବସାୟୀମାନେ TapFX କିପରି ବ୍ୟବହାର କରନ୍ତି',
      testimonialsNote: 'ଏହା କେବଳ ଉଦାହରଣ ପ୍ରଦର୍ଶନ ପ୍ରୋଫାଇଲ୍ ଅଟେ।',
      faqTitle: 'ସାଧାରଣ ପ୍ରଶ୍ନୋତ୍ତର',
    },
    reviewPage: {
      reviewButton: 'Google ରେ ରିଭ୍ୟୁ ଦିଅନ୍ତୁ',
      needHelp: 'ଲେଖିବାରେ ସାହାଯ୍ୟ ଦରକାର କି?',
      tellPrivately: 'ଦୋକାନକୁ ବ୍ୟକ୍ତିଗତ ଭାବରେ ଜଣାନ୍ତୁ',
      aiDisclosure: 'AI ଏହାକୁ ଲେଖିବାରେ ସାହାଯ୍ୟ କରିଛି। କେବଳ ଆପଣଙ୍କ ପ୍ରକୃତ ଅନୁଭବ ଲେଖନ୍ତୁ।',
      pickRating: 'ଆପଣଙ୍କ ଅନୁଭବ କିପରି ଥିଲା?',
      pickTags: 'ଆପଣଙ୍କୁ କ’ଣ ଭଲ ଲାଗିଲା ବାଛନ୍ତୁ',
      optionalNote: 'କିଛି ଟିପ୍ପଣୀ ଯୋଡ଼ନ୍ତୁ (ଇଚ୍ଛାଧୀନ)',
      generateDrafts: 'ଲେଖା ପ୍ରସ୍ତାବ ଦେଖନ୍ତୁ',
      copyAndOpen: 'କପି କରି Google ଖୋଲନ୍ତୁ',
      copiedNotice: 'କପି ହୋଇଗଲା — Google ରିଭ୍ୟୁରେ ପେଷ୍ଟ୍ କରନ୍ତୁ।',
      needMoreDetails: 'ଦୟାକରି ଆପଣ ଦେଖିଥିବା ଗୋଟିଏ କଥା ଜଣାନ୍ତୁ।',
      privateFeedbackTitle: 'ଦୋକାନ ମାଲିକଙ୍କୁ ସିଧାସଳଖ ମତାମତ ଦିଅନ୍ତୁ',
      privateFeedbackHint: 'ଆପଣଙ୍କ ବାର୍ତ୍ତା ସିଧା ଦୋକାନକୁ ଯିବ। ଆପଣ Google ରେ ମଧ୍ୟ ରିଭ୍ୟୁ ଦେଇପାରିବେ।',
      sendFeedback: 'ବାର୍ତ୍ତା ପଠାନ୍ତୁ',
      feedbackSent: 'ଧନ୍ୟବାଦ — ଆପଣଙ୍କ ମତାମତ ଦୋକାନ ମାଲିକଙ୍କ ପାଖକୁ ପଠାଯାଇଛି।',
      poweredBy: 'TapFX ଦ୍ୱାରା ପରିଚାଳିତ',
      followUs: 'ଆମ ସହିତ ଯୋଡ଼ି ହୁଅନ୍ତୁ',
    },
    orderFlow: {
      title: 'TapFX କାର୍ଡ୍ କଷ୍ଟମାଇଜ୍ ଓ ଅର୍ଡର୍ କରନ୍ତୁ',
      subtitle: 'ଅର୍ଡର୍ ପୂର୍ବରୁ ଆପଣଙ୍କ କାର୍ଡର ଆଗ ଓ ପଛ ଡିଜାଇନ୍ ଲାଇଭ୍ ଦେଖନ୍ତୁ।',
      stepProduct: '୧. ପ୍ରଡକ୍ଟ ଓ ପରିମାଣ ବାଛନ୍ତୁ',
      stepDetails: '୨. ଦୋକାନ ବିବରଣୀ ଓ ଲିଙ୍କ୍',
      stepShipping: '୩. ଡିଜାଇନ୍ ନିଶ୍ଚିତକରଣ ଓ ପେମେଣ୍ଟ',
      payUpi: 'UPI ଦ୍ୱାରା ପେମେଣ୍ଟ କରନ୍ତୁ',
      payCard: 'ଡେବିଟ୍ / କ୍ରେଡିଟ୍ କାର୍ଡ୍',
      orderWhatsapp: 'WhatsApp ରେ ଅର୍ଡର୍ କରନ୍ତୁ',
      placeOrder: 'ଅର୍ଡର୍ ନିଶ୍ଚିତ କରନ୍ତୁ',
      trackOrder: 'ଅର୍ଡର୍ ଟ୍ରାକ୍ କରନ୍ତୁ',
    },
    footer: {
      tagline: 'ଗୋଟିଏ ଟ୍ୟାପ୍। ଅସୀମ ସମ୍ଭାବନା।',
      platform: 'ପ୍ଲାଟଫର୍ମ',
      products: 'ପ୍ରଡକ୍ଟସ୍',
      company: 'କମ୍ପାନୀ',
      legal: 'ଆଇନଗତ',
      contactLine: 'WhatsApp +91 96922 99405 · tapfxx@gmail.com · @tap.fx',
      copyright: '© 2026 TapFX. ସର୍ବସ୍ୱତ୍ୱ ସଂରକ୍ଷିତ।',
    },
  },
  hi: {
    nav: {
      home: 'होम',
      generator: 'QR जेनरेटर',
      multiLink: 'मल्टी-लिंक पेज',
      nfcCards: 'NFC कार्ड',
      products: 'प्रोडक्ट्स',
      pricing: 'प्राइसिंग',
      login: 'लॉगिन',
      signup: 'साइन अप',
      getStarted: 'मुफ्त शुरू करें',
      dashboard: 'डैशबोर्ड',
    },
    hero: {
      kicker: 'TapFX प्लेटफॉर्म · डायनामिक QR, NFC कार्ड और Google रिव्यू',
      headline: 'एक QR. अनगिनत संभावनाएं।',
      subheadline:
        'एक ही प्लेटफॉर्म से डायनामिक QR कोड, डिजिटल बिजनेस प्रोफाइल और NFC रिव्यू कार्ड बनाएं और हर ग्राहक विजिट को असली Google रिव्यू में बदलें।',
      primaryCta: 'बनाना शुरू करें',
      secondaryCta: 'TapFX कार्ड देखें',
      tapToPreview: 'लाइव टैप और स्कैन डेमो',
      qrMode: 'QR स्कैन',
      nfcMode: 'NFC टैप',
      liveScanToast: 'स्कैन रिकॉर्ड हुआ · कलिंग स्पाइस बिस्ट्रो · रिव्यू पेज खुला',
    },
    sections: {
      featuresTitle: 'आपकी जरूरत की हर सुविधा। एक प्लेटफॉर्म।',
      featuresSubtitle:
        'रेस्टोरेंट, क्लिनिक, फार्मेसी, रिटेल शॉप और प्रोफेशनल्स के लिए भरोसेमंद QR और NFC सिस्टम।',
      multiLinkTitle: 'एक लिंक। आपका पूरा बिजनेस।',
      multiLinkSubtitle:
        'WhatsApp ऑर्डर, Google रिव्यू, मेन्यू, Instagram और लोकेशन एक मोबाइल पेज पर रखें। कार्ड बदले बिना कभी भी लिंक अपडेट करें।',
      multiLinkCta: 'डिजिटल प्रोफाइल बनाएं',
      productsTitle: 'TapFX NFC कलेक्शन से मिलें।',
      productsSubtitle: 'प्रीमियम NFC बिजनेस कार्ड और एक्रिलिक QR स्टैंड, आपकी दुकान की ब्रांडिंग के साथ।',
      howItWorksTitle: 'मिनटों में शुरुआत करें',
      analyticsTitle: 'रियल-टाइम स्कैन और रिव्यू एनालिटिक्स',
      pricingTitle: 'सरल और पारदर्शी प्लान्स',
      useCasesTitle: 'हर बिजनेस और प्रोफेशनल के लिए',
      testimonialsTitle: 'बिजनेस TapFX का उपयोग कैसे करते हैं',
      testimonialsNote: 'ये केवल उदाहरण के लिए डेमो प्रोफाइल हैं।',
      faqTitle: 'अक्सर पूछे जाने वाले सवाल',
    },
    reviewPage: {
      reviewButton: 'Google पर रिव्यू दें',
      needHelp: 'लिखने में मदद चाहिए?',
      tellPrivately: 'दुकान को निजी तौर पर बताएं',
      aiDisclosure: 'AI ने इसे शब्दों में ढालने में मदद की। केवल अपना असली अनुभव लिखें।',
      pickRating: 'आपका अनुभव कैसा रहा?',
      pickTags: 'जो खास लगा उसे चुनें',
      optionalNote: 'छोटा नोट जोड़ें (वैकल्पिक)',
      generateDrafts: 'विकल्प सुझाएं',
      copyAndOpen: 'कॉपी करें और Google खोलें',
      copiedNotice: 'कॉपी हो गया — Google रिव्यू में पेस्ट करें।',
      needMoreDetails: 'कृपया बताएं कि आपने क्या अनुभव किया।',
      privateFeedbackTitle: 'सीधे मालिक को फीडबैक भेजें',
      privateFeedbackHint: 'आपका संदेश निजी तौर पर दुकान टीम तक पहुंचेगा। आप Google पर भी रिव्यू दे सकते हैं।',
      sendFeedback: 'निजी संदेश भेजें',
      feedbackSent: 'धन्यवाद — आपका फीडबैक दुकान मालिक तक पहुंचा दिया गया है।',
      poweredBy: 'TapFX द्वारा संचालित',
      followUs: 'हमसे जुड़ें',
    },
    orderFlow: {
      title: 'TapFX हार्डवेयर कस्टमाइज और ऑर्डर करें',
      subtitle: 'ऑर्डर कन्फर्म करने से पहले अपने कार्ड का फ्रंट और बैक प्रूफ लाइव देखें।',
      stepProduct: '1. प्रोडक्ट और मात्रा चुनें',
      stepDetails: '2. ब्रांड विवरण और लिंक',
      stepShipping: '3. प्रूफ अप्रूवल और पेमेंट',
      payUpi: 'UPI से भुगतान करें (तुरंत)',
      payCard: 'डेबिट / क्रेडिट कार्ड',
      orderWhatsapp: 'WhatsApp पर ऑर्डर करें',
      placeOrder: 'ऑर्डर कन्फर्म करें',
      trackOrder: 'ऑर्डर ट्रैक करें',
    },
    footer: {
      tagline: 'एक टैप। अनगिनत संभावनाएं।',
      platform: 'प्लेटफॉर्म',
      products: 'प्रोडक्ट्स',
      company: 'कंपनी',
      legal: 'कानूनी',
      contactLine: 'WhatsApp +91 96922 99405 · tapfxx@gmail.com · @tap.fx',
      copyright: '© 2026 TapFX. सर्वाधिकार सुरक्षित।',
    },
  },
};
