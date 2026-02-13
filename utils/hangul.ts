/**
 * Hangul composition utility for Dubeolsik (standard Korean keyboard)
 */

const CHOSEONG = [
  "ㄱ",
  "ㄲ",
  "ㄴ",
  "ㄷ",
  "ㄸ",
  "ㄹ",
  "ㅁ",
  "ㅂ",
  "ㅃ",
  "ㅅ",
  "ㅆ",
  "ㅇ",
  "ㅈ",
  "ㅉ",
  "ㅊ",
  "ㅋ",
  "ㅌ",
  "ㅍ",
  "ㅎ",
];
const JUNGSEONG = [
  "ㅏ",
  "ㅐ",
  "ㅑ",
  "ㅒ",
  "ㅓ",
  "ㅔ",
  "ㅕ",
  "ㅖ",
  "ㅗ",
  "ㅘ",
  "ㅙ",
  "ㅚ",
  "ㅛ",
  "ㅜ",
  "ㅝ",
  "ㅞ",
  "ㅟ",
  "ㅠ",
  "ㅡ",
  "ㅢ",
  "ㅣ",
];
const JONGSEONG = [
  "",
  "ㄱ",
  "ㄲ",
  "ㄳ",
  "ㄴ",
  "ㄵ",
  "ㄶ",
  "ㄷ",
  "ㄹ",
  "ㄺ",
  "ㄻ",
  "ㄼ",
  "ㄽ",
  "ㄾ",
  "ㄿ",
  "ㅀ",
  "ㅁ",
  "ㅂ",
  "ㅄ",
  "ㅅ",
  "ㅆ",
  "ㅇ",
  "ㅈ",
  "ㅊ",
  "ㅋ",
  "ㅌ",
  "ㅍ",
  "ㅎ",
];

// Complex Jamo mappings
const COMPLEX_JUNG = {
  ㅗㅏ: "ㅘ",
  ㅗㅐ: "ㅙ",
  ㅗㅣ: "ㅚ",
  ㅜㅓ: "ㅝ",
  ㅜㅔ: "ㅞ",
  ㅜㅣ: "ㅟ",
  ㅡㅣ: "ㅢ",
};
const COMPLEX_JONG = {
  ㄱㅅ: "ㄳ",
  ㄴㅈ: "ㄵ",
  ㄴㅎ: "ㄶ",
  ㄹㄱ: "ㄺ",
  ㄹㅁ: "ㄻ",
  ㄹㅂ: "ㄼ",
  ㄹㅅ: "ㄽ",
  ㄹㅌ: "ㄾ",
  ㄹㅍ: "ㄿ",
  ㄹㅎ: "ㅀ",
  ㅂㅅ: "ㅄ",
};

export function composeHangul(text: string, newChar: string): string {
  // This is a simplified state-based composer for common Dubeolsik input
  // In a real production app, you might use a more robust library like 'hangul-js'
  // But for this mock, we'll implement a basic one that handles most cases.

  // Basic case: if newChar is space or backspace is handled elsewhere
  if (newChar === " ") return text + " ";

  // If text is empty, just add newChar
  if (!text) return newChar;

  const lastChar = text[text.length - 1];
  const lastCode = lastChar.charCodeAt(0);

  // Logic for standalone Jamo composition (e.g., 'ㄱ' + 'ㅏ' -> '가')
  if (lastCode < 0xac00 || lastCode > 0xd7a3) {
    if (CHOSEONG.includes(lastChar) && JUNGSEONG.includes(newChar)) {
      const cho = CHOSEONG.indexOf(lastChar);
      const jung = JUNGSEONG.indexOf(newChar);
      return (
        text.slice(0, -1) + String.fromCharCode((cho * 21 + jung) * 28 + 0xac00)
      );
    }
    return text + newChar;
  }

  // Decomposition of last syllable
  const code = lastCode - 0xac00;
  const jongIdx = code % 28;
  const jungIdx = ((code - jongIdx) / 28) % 21;
  const choIdx = Math.floor((code - jongIdx) / 28 / 21);

  const Lcho = CHOSEONG[choIdx];
  const Ljung = JUNGSEONG[jungIdx];
  const Ljong = JONGSEONG[jongIdx];

  // Logic for adding a Jungseong (vowel)
  if (JUNGSEONG.includes(newChar)) {
    // If last syllable had a Jongseong, move it to next choseong
    if (jongIdx > 0) {
      // Handle complex Jongseong splitting (e.g., '기억' + 'ㅏ' -> '기가')
      // (Simplified: just move last part of jongseong to next)
      const baseText =
        text.slice(0, -1) +
        String.fromCharCode((choIdx * 21 + jungIdx) * 28 + 0xac00);
      return baseText + composeHangul(Ljong, newChar);
    }
    // Else try to combine with Jungseong if possible (ㅗ + ㅏ = ㅘ)
    const combinedJung = COMPLEX_JUNG[Ljung + newChar];
    if (combinedJung) {
      const newJungIdx = JUNGSEONG.indexOf(combinedJung);
      return (
        text.slice(0, -1) +
        String.fromCharCode((choIdx * 21 + newJungIdx) * 28 + 0xac00)
      );
    }
    return text + newChar;
  }

  // Logic for adding a Choseong/Jongseong (consonant)
  if (CHOSEONG.includes(newChar)) {
    // If no Jongseong, try to add it
    if (jongIdx === 0) {
      const newJongIdx = JONGSEONG.indexOf(newChar);
      if (newJongIdx !== -1) {
        return (
          text.slice(0, -1) +
          String.fromCharCode(
            (choIdx * 21 + jungIdx) * 28 + newJongIdx + 0xac00,
          )
        );
      }
    } else {
      // Try to combine with existing Jongseong (ㄱ + ㅅ = ㄳ)
      const combinedJong = COMPLEX_JONG[Ljong + newChar];
      if (combinedJong) {
        const newJongIdx = JONGSEONG.indexOf(combinedJong);
        return (
          text.slice(0, -1) +
          String.fromCharCode(
            (choIdx * 21 + jungIdx) * 28 + newJongIdx + 0xac00,
          )
        );
      }
    }
    return text + newChar;
  }

  return text + newChar;
}
