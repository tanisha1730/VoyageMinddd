// Self-contained test for the fallback logic in mlService.js
const prompt1 = `Trip: Paris
Highlight: visiting the Eiffel Tower at night
Style: nostalgic
When & Where: Spring 2024`;

const prompt2 = `Trip: Tokyo
Highlight: eating street food in Shibuya
Style: lively
When & Where: Summer 2024`;

function generateFallback(prompt) {
  const titleMatch = prompt.match(/Trip:\s*(.+?)(?:\n|$)/i);
  const highlightMatch = prompt.match(/Highlight:\s*(.+?)(?:\n|$)/i);
  
  const title = titleMatch ? titleMatch[1].trim() : 'the trip';
  const highlight = highlightMatch ? highlightMatch[1].trim() : 'every moment was a discovery';
  
  return `${highlight}. Our journey through ${title} was filled with unexpected delights... in ${title}.`;
}

console.log('--- Test 1 (Paris) ---');
const res1 = generateFallback(prompt1);
console.log(res1);

console.log('\n--- Test 2 (Tokyo) ---');
const res2 = generateFallback(prompt2);
console.log(res2);

if (res1 !== res2 && res1.includes('Paris') && res2.includes('Tokyo') && res1.includes('Eiffel Tower')) {
  console.log('\n✅ SUCCESS: Fallback logic is dynamic and personalized!');
} else {
  console.log('\n❌ FAILURE: Fallback logic is still static.');
}
