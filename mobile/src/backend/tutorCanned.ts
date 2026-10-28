import type { Lang } from '../types';
import type { TutorMode } from './types';

// Offline answers so the tutor works in the demo without a backend.
// Same line format as the live tutor: "DE: <German>" then "Meaning: ..." lines.
type Canned = { keywords: string[]; answer: Record<Lang, string> };

const CANNED: Canned[] = [
  {
    keywords: ['good morning', 'morning', 'శుభోదయం', 'सुप्रभात', 'guten morgen'],
    answer: {
      en: 'In the morning, Germans say:\nDE: Guten Morgen!\nMeaning: "Good morning!" (GOO-ten MOR-gen)\nUntil about 11 am. After that, say "Guten Tag".',
      te: 'ఉదయం జర్మన్లు ఇలా అంటారు:\nDE: Guten Morgen!\nMeaning: "శుభోదయం!" (గూటెన్ మోర్గెన్)\nసుమారు ఉదయం 11 వరకు. తర్వాత "Guten Tag" అనండి.',
      hi: 'सुबह जर्मन लोग कहते हैं:\nDE: Guten Morgen!\nMeaning: "सुप्रभात!" (गूटेन मॉर्गन)\nलगभग सुबह 11 बजे तक। उसके बाद "Guten Tag" कहें।',
    },
  },
  {
    keywords: ['name', 'పేరు', 'नाम', 'heiße', 'heisse'],
    answer: {
      en: 'To say your name:\nDE: Ich heiße Ravi.\nMeaning: "My name is Ravi." (ish HY-seh RAH-vee)\nPut your own name at the end.',
      te: 'మీ పేరు చెప్పడానికి:\nDE: Ich heiße Ravi.\nMeaning: "నా పేరు రవి." (ఇష్ హైసె రవి)\nచివర మీ పేరు పెట్టండి.',
      hi: 'अपना नाम बताने के लिए:\nDE: Ich heiße Ravi.\nMeaning: "मेरा नाम रवि है।" (इश हाइसे रवि)\nअंत में अपना नाम लगाएँ।',
    },
  },
  {
    keywords: ['coffee', 'కాఫీ', 'कॉफ़ी', 'कॉफी', 'kaffee', 'order'],
    answer: {
      en: 'To order a coffee politely:\nDE: Einen Kaffee, bitte.\nMeaning: "A coffee, please." (EYE-nen KAH-feh, BIT-teh)',
      te: 'మర్యాదగా కాఫీ ఆర్డర్ చేయడానికి:\nDE: Einen Kaffee, bitte.\nMeaning: "ఒక కాఫీ, దయచేసి." (ఐనెన్ కాఫే, బిట్టె)',
      hi: 'विनम्रता से कॉफ़ी मँगाने के लिए:\nDE: Einen Kaffee, bitte.\nMeaning: "एक कॉफ़ी, कृपया।" (आइनेन काफ़े, बिट्टे)',
    },
  },
  {
    keywords: ['yesterday', 'gestern', 'నిన్న', 'कल', 'past', 'kino'],
    answer: {
      en: 'Almost! Verbs of movement use "sein", not "haben":\nDE: Ich bin gestern ins Kino gegangen.\nMeaning: "I went to the cinema yesterday." (ish bin GES-tern ins KEE-no ge-GANG-en)',
      te: 'దాదాపు సరి! కదలిక క్రియలతో "haben" కాదు, "sein" వాడాలి:\nDE: Ich bin gestern ins Kino gegangen.\nMeaning: "నేను నిన్న సినిమాకు వెళ్ళాను." (ఇష్ బిన్ గెస్టర్న్ ఇన్స్ కీనో గెగాంగెన్)',
      hi: 'लगभग सही! गति वाली क्रियाओं के साथ "haben" नहीं, "sein" आता है:\nDE: Ich bin gestern ins Kino gegangen.\nMeaning: "मैं कल सिनेमा गया था।" (इश बिन गेस्टर्न इन्स कीनो गेगांगेन)',
    },
  },
  {
    keywords: ['thank', 'ధన్యవాద', 'धन्यवाद', 'danke'],
    answer: {
      en: 'To say thank you:\nDE: Danke schön!\nMeaning: "Thank you very much!" (DAHN-keh shurn)',
      te: 'ధన్యవాదాలు చెప్పడానికి:\nDE: Danke schön!\nMeaning: "చాలా ధన్యవాదాలు!" (డాంకె ష్యోన్)',
      hi: 'धन्यवाद कहने के लिए:\nDE: Danke schön!\nMeaning: "बहुत धन्यवाद!" (डांके श्योन)',
    },
  },
];

const OFFLINE: Record<Lang, string> = {
  en: 'The live tutor needs internet and a server connection. In this demo I can answer a few questions, for example "How do I say good morning?"',
  te: 'లైవ్ ట్యూటర్‌కు ఇంటర్నెట్ మరియు సర్వర్ అవసరం. ఈ డెమోలో కొన్ని ప్రశ్నలకు జవాబు ఇవ్వగలను, ఉదాహరణకు "గుడ్ మార్నింగ్ ఎలా చెప్పాలి?"',
  hi: 'लाइव ट्यूटर के लिए इंटरनेट और सर्वर चाहिए। इस डेमो में मैं कुछ सवालों के जवाब दे सकता हूँ, जैसे "गुड मॉर्निंग कैसे कहें?"',
};

export function cannedAnswer(question: string, lang: Lang, _mode: TutorMode): string {
  const q = question.toLowerCase();
  const hit = CANNED.find((c) => c.keywords.some((k) => q.includes(k.toLowerCase())));
  return hit ? hit.answer[lang] : OFFLINE[lang];
}
