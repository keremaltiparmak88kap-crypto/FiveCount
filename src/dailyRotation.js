// Günlük içerik seçimi için ortak mantık. "Court Code", "Missing 5", "Draft Roulette" gibi
// günlük bulmacalarda kullanılır. Amaç: hem HERKESE aynı gün aynı içeriği vermek, hem de
// havuz bitip baştan döndüğünde AYNI SIRAYLA tekrar etmemesini sağlamak.
//
// Nasıl çalışır: Havuzun tamamı bir "tur" (cycle). Her tur, bir önceki turdan FARKLI bir
// sırayla karıştırılır (turun numarasına göre seed'lenmiş bir shuffle ile). Yani bir tur
// içinde (örn. ilk 30 gün) hiç tekrar yok; bir sonraki tur (31-60. günler) farklı bir
// sırayla ilerler, önceki turla aynı günde aynı öğeye denk gelme ihtimali çok düşük.
 
const seededShuffle = (array, seed) => {
  const arr = [...array];
  let s = seed || 1;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};
 
// pool: seçilecek öğelerin listesi. Her gün (UTC gece yarısında değişen) pool'dan bir öğe döner.
export const getDailyItem = (pool) => {
  const daysSinceEpoch = Math.floor(Date.now() / 86400000);
  const cycleLength = pool.length;
  const cycleNumber = Math.floor(daysSinceEpoch / cycleLength);
  const positionInCycle = daysSinceEpoch % cycleLength;
  const shuffled = seededShuffle(pool, cycleNumber + 1);
  return shuffled[positionInCycle];
};
 
// Aynı mantık ama öğe yerine INDEX döner — Missing 5 gibi "günün öğesinden başlayıp
// sıralı devam eden" oyunlarda kullanılır.
export const getDailyIndex = (poolLength) => {
  const daysSinceEpoch = Math.floor(Date.now() / 86400000);
  const cycleLength = poolLength;
  const cycleNumber = Math.floor(daysSinceEpoch / cycleLength);
  const positionInCycle = daysSinceEpoch % cycleLength;
  const indices = seededShuffle([...Array(poolLength).keys()], cycleNumber + 1);
  return indices[positionInCycle];
};
 
// Büyük bir havuzdan HER GÜN farklı bir "count" adet öğelik alt küme seçer (örn. Bingo'nun
// 16 kategorisi). Her gün havuzun tamamı yeniden karıştırılır, bu yüzden kombinasyon sayısı
// havuz büyüdükçe patlar (örn. 24 kategoriden 16 seçmek = 735.471 farklı kombinasyon) —
// pratikte aylarca/yıllarca aynı kombinasyonun tekrar etmesi neredeyse imkansızdır.
export const getDailySubset = (pool, count) => {
  const daysSinceEpoch = Math.floor(Date.now() / 86400000);
  const shuffled = seededShuffle(pool, daysSinceEpoch + 1);
  return shuffled.slice(0, count);
};
 