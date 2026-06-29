// src/ShareButton.jsx
export const ShareButton = ({ gameName, score }) => {
  const handleShare = () => {
    const text = `FiveCourt - ${gameName} 🏀\nDaily Score: ${score}\n\nplay.fivecourt.com #FiveCourt #NBA`;
    navigator.clipboard.writeText(text);
    alert("Skor panoya kopyalandı! Twitter'da paylaşabilirsin.");
  };

  return (
    <button 
      onClick={handleShare}
      className="bg-white/5 border border-white/10 px-6 py-3 rounded-full font-black hover:bg-orange-600/20 transition-all"
    >
      SONUCU PAYLAŞ 📲
    </button>
  );
};