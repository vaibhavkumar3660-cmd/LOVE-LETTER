/**
 * Love Letter Configuration
 * You can edit any of these details directly here, or use the
 * "Personalize ⚙️" button right on the webpage to customize them!
 */
const LOVE_LETTER_CONFIG = {
  // Recipient and Sender Info
  recipientName: "FLASH", // e.g. "Sarah", "Emily", "Honey"
  senderName: "VEBV", // e.g. "Alex", "David"
  specialDate: "21 AUG", // e.g. "October 14, 2023" or "Our 1st Anniversary"
  
  // Theme styling
  theme: {
    accentColor: "#b98262",
    softBackground: "linear-gradient(135deg, #1b1015 0%, #321a24 52%, #5a2938 100%)",
    paperColor: "#fffaf4"
  },

  // Audio settings
  // If customAudioUrl is empty, it uses the built-in gentle romantic music box melody
  music: {
    customAudioUrl: "", // optional: paste a direct MP3 link here
    autoPlayPrompt: "Click anywhere to begin with romantic music 🎶"
  },

  // The Letter & Questions Journey
  // Each step reveals a chapter of your letter followed by an interactive question!
  chapters: [
    {
      title: "Chapter I: The Spark",
      text: "From the very first moment you walked into my world, everything became softer, warmer, and brighter. I still remember the first time our eyes met — it was as if time decided to slow down just so I could take in the most beautiful person I had ever seen.",
      question: {
        prompt: "Do you remember the very first time we talked?",
        options: [
          { text: "Of course, like it was yesterday ✨", reaction: "I knew from that very second that you were going to be someone unforgettable." },
          { text: "You were so cute and nervous! 🤭", reaction: "Hey! You can't blame me, you completely took my breath away!" },
          { text: "It felt like instant magic ❤️", reaction: "It truly was. My heart recognized yours before my mind even caught up." }
        ]
      }
    },
    {
      title: "Chapter II: The Little Things",
      text: "It isn't just the big milestone days that make me fall in love with you over and over again. It’s the quiet little things — the sound of your laugh when something genuinely tickles you, the way you tuck your hair behind your ear, and how simply talking to you makes any chaotic day feel peaceful.",
      question: {
        prompt: "If I had to choose, what do you think is my favorite thing about you?",
        options: [
          { text: "Your warm, infectious smile 😊", reaction: "Your smile is literally the brightest part of my day." },
          { text: "Your gentle, caring heart 💖", reaction: "The kindness and empathy you give to the world inspires me constantly." },
          { text: "Your adorable sense of humor 🌸", reaction: "Nobody makes me laugh or feel as happy as you do." },
          { text: "All of the above (and a million more) ✨", reaction: "Bingo! There aren't enough words in any language to list everything I adore about you." }
        ]
      }
    },
    {
      title: "Chapter III: The Measure of My Love",
      text: "Sometimes I catch myself just staring at you, wondering how I got so incredibly lucky. In a universe so vast and full of billions of people, somehow, the stars aligned and brought me to you. You are my safe harbor, my favorite adventure, and my cutie pie.",
      question: {
        type: "slider",
        prompt: "On a scale of 1 to Infinity, how much do you think you mean to me?",
        minLabel: "A Whole Lot 🥰",
        maxLabel: "To Infinity & Beyond 🚀💖",
        reactions: [
          "More than that...",
          "Keep sliding to the right!",
          "Almost there...",
          "YES! Beyond the stars and back forever! ✨❤️"
        ]
      }
    },
    {
      title: "Chapter IV: Forever & Always",
      text: "No matter where life takes us — through the sunny adventures, the quiet rainy mornings, and every dream we chase together — there is one promise I will keep every single day: to cherish you, protect your heart, and love you more tomorrow than I do today.",
      question: {
        type: "proposal",
        prompt: "Will you hold my hand and be my girl forever? 💕",
        yesText: "YES, A THOUSAND TIMES YES! 💖",
        noText: "Hmm, let me think... (No) 🙈"
      }
    }
  ],

  // Final celebration message after she says YES!
  celebration: {
    heading: "You Made Me The Happiest! 🎉💍❤️",
    subheading: "My heart is yours forever and always.",
    badge: "Official Certificate of Infinite Love",
    sealText: "Sealed with Love & Infinite Kisses"
  }
};
