// Dictionary of common words and their misspellings
type DictionaryEntry = {
  word: string;
  misspellings: string[];
};

// Common words with their common misspellings - this is a small sample,
// in a real application this would be much larger or we would use an external API
const dictionary: DictionaryEntry[] = [
  { word: 'hello', misspellings: ['hallo', 'helo', 'hullo', 'hellow'] },
  { word: 'world', misspellings: ['worlld', 'worild', 'wordl', 'wrold'] },
  { word: 'their', misspellings: ['thier', 'there', 'thair', 'ther'] },
  { word: 'they', misspellings: ['thay', 'thy', 'dey', 'tey'] },
  { word: 'receive', misspellings: ['recieve', 'receve', 'receeve', 'reciive'] },
  { word: 'believe', misspellings: ['beleive', 'belive', 'bleieve', 'bilieve'] },
  { word: 'separate', misspellings: ['seperate', 'seprate', 'separete', 'saparate'] },
  { word: 'definitely', misspellings: ['definately', 'definatly', 'definetly', 'defiantly'] },
  { word: 'necessary', misspellings: ['neccessary', 'necessery', 'neccesary', 'necesary'] },
  { word: 'argument', misspellings: ['arguement', 'arguemant', 'arguiment', 'argumint'] },
  { word: 'environment', misspellings: ['enviroment', 'enviornment', 'environement', 'envirument'] },
  { word: 'occurrence', misspellings: ['occurence', 'occurrance', 'ocurrence', 'occurance'] },
  { word: 'tomorrow', misspellings: ['tommorow', 'tommorrow', 'tomorow', 'tomoro'] },
  { word: 'beginning', misspellings: ['begining', 'beginnning', 'beggining', 'begining'] },
  { word: 'accidentally', misspellings: ['accidently', 'accidentaly', 'accidentlly', 'acidentally'] },
  { word: 'address', misspellings: ['adress', 'addres', 'addrress', 'addresse'] },
  { word: 'business', misspellings: ['busines', 'buisness', 'busness', 'bussiness'] },
  { word: 'calendar', misspellings: ['calender', 'calander', 'callendar', 'calandar'] },
  { word: 'conscience', misspellings: ['concience', 'consience', 'concsience', 'conscence'] },
  { word: 'colleague', misspellings: ['collegue', 'colleage', 'collaegue', 'colleauge'] },
  { word: 'embarrass', misspellings: ['embarass', 'embaras', 'embaras', 'embaress'] },
  { word: 'grammar', misspellings: ['grammer', 'gramar', 'gramer', 'gramar'] },
  { word: 'hollow', misspellings: ['hallow', 'holow', 'halllow', 'hollaw'] },
  { word: 'immediate', misspellings: ['imediate', 'immedate', 'imediatte', 'immidiate'] },
  { word: 'possess', misspellings: ['posess', 'possses', 'posses', 'posesses'] },
  { word: 'restaurant', misspellings: ['restaraunt', 'restarant', 'restraunt', 'resturant'] },
  { word: 'rhythm', misspellings: ['rythm', 'rhythem', 'ryththm', 'rythym'] }
];

// Map from misspellings to their correct words
const misspellingMap = new Map<string, string>();

// Initialize the map 
dictionary.forEach(entry => {
  entry.misspellings.forEach(misspelling => {
    misspellingMap.set(misspelling.toLowerCase(), entry.word);
  });
});

/**
 * Checks if a word is misspelled and returns the correct spelling
 * @param word The word to check
 * @returns The corrected word or null if the word is not misspelled
 */
export function checkSpelling(word: string): string | null {
  const lowercaseWord = word.toLowerCase();
  return misspellingMap.get(lowercaseWord) || null;
}

/**
 * Get spelling suggestions for a word
 * @param word The word to check
 * @returns List of spelling suggestions or an empty array if no suggestions
 */
export function getSpellingSuggestions(word: string): string[] {
  const correction = checkSpelling(word.toLowerCase());
  if (correction) {
    // Return the correct spelling as the first suggestion
    return [correction];
  }
  
  // If no exact misspelling is found, find similar words
  // This is a simple similarity algorithm, in a real app this would be more sophisticated
  const suggestions: string[] = [];
  const lowercaseWord = word.toLowerCase();
  
  // Words with similar first letter (simple prefix matching)
  dictionary.forEach(entry => {
    if (entry.word.startsWith(lowercaseWord.charAt(0))) {
      suggestions.push(entry.word);
    }
  });
  
  // Calculate Levenshtein distance for more precise suggestions
  // (simplified version for demo purposes)
  if (suggestions.length < 3) {
    dictionary.forEach(entry => {
      if (!suggestions.includes(entry.word) && 
         levenshteinDistance(lowercaseWord, entry.word) <= 3) {
        suggestions.push(entry.word);
      }
    });
  }
  
  // Return top 4 suggestions or fewer
  return suggestions.slice(0, 4);
}

/**
 * Calculate the Levenshtein distance between two strings
 * This measures how many edits are needed to change one string to another
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  // Initialize the matrix
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill the matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Check if a word is misspelled
 */
export function isWordMisspelled(word: string): boolean {
  return !!checkSpelling(word);
}

/**
 * Simple function to identify potential misspelled words in text
 * In a real application, this would be much more sophisticated
 */
export function findMisspelledWords(text: string): string[] {
  // Split into words, remove punctuation
  const words = text.split(/\s+/)
    .map(word => word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ""));
  
  // Filter down to just misspelled words
  return words.filter(word => word.length > 1 && isWordMisspelled(word));
}

/**
 * Add a custom word to the user's dictionary
 * In a real app, this would persist to storage
 */
export function addToDictionary(word: string): void {
  // A real implementation would add this to a user's custom dictionary
  console.log(`Added "${word}" to custom dictionary`);
}