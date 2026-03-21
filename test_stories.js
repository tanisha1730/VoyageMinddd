const { generateText } = require('./backend/src/services/mlService');

async function testGeneration() {
  const trip1 = `Trip: Paris
Highlight: visiting the Eiffel Tower at night
Style: nostalgic
When & Where: Spring 2024`;

  const trip2 = `Trip: Tokyo
Highlight: eating street food in Shibuya
Style: lively
When & Where: Summer 2024`;

  console.log('--- Trip 1 (Paris) ---');
  const story1 = await generateText(trip1);
  console.log(story1.text);

  console.log('\n--- Trip 2 (Tokyo) ---');
  const story2 = await generateText(trip2);
  console.log(story2.text);

  if (story1.text !== story2.text && story1.text.includes('Paris') && story2.text.includes('Tokyo')) {
    console.log('\n✅ SUCCESS: Stories are dynamic and personalized!');
  } else {
    console.log('\n❌ FAILURE: Stories are still static or not personalized.');
  }
}

testGeneration();
