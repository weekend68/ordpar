console.log('🤖 Testar Railway AI-generering direkt...\n');

const response = await fetch('http://localhost:3002/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    player_profile: {
      ordförråd: 'medel',
      ordlekar: 'medel',
      kulturella_referenser: 'medel',
      abstrakt_tänkande: 'medel'
    },
    feedback: ''
  })
});

console.log('Status:', response.status, response.statusText);

const data = await response.json();

if (data.success) {
  console.log('\n✅ AI-generering lyckades!\n');
  console.log('📊 Genererade grupper:');
  data.word_set.groups.forEach((group: any, i: number) => {
    console.log(`\n${i + 1}. ${group.category}`);
    console.log(`   Ord: ${group.words.join(', ')}`);
    console.log(`   Typ: ${group.type}`);
    console.log(`   Förklaring: ${group.explanation}`);
  });
} else {
  console.log('\n❌ Error:', data.error);
}
