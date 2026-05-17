export const profile = {
  name: "Creator Name",
  handle: "@creatorhandle",
  location: "London, UK",
  headline: "Creative direction, movement, image-making, and beauty work.",
  intro:
    "A portfolio for a multi-discipline creator working across photography, video edits, street dance, social content, and eyebrow tattooing.",
  email: "hello@example.com",
  instagram: "https://instagram.com/",
  tiktok: "https://www.tiktok.com/",
  booking: "#booking"
};

export const heroLandscapes = [
  {
    src: "/assets/landscapes/mountain-valley.webp",
    alt: "Misty mountain valley at sunrise"
  },
  {
    src: "/assets/landscapes/black-sand-coast.webp",
    alt: "Black-sand coastline at blue hour"
  },
  {
    src: "/assets/landscapes/desert-canyon.webp",
    alt: "Desert canyon after rain"
  },
  {
    src: "/assets/landscapes/rainforest-waterfall.webp",
    alt: "Rainforest waterfall and emerald pool"
  },
  {
    src: "/assets/landscapes/arctic-aurora.webp",
    alt: "Frozen arctic lake under aurora lights"
  }
];

export const folders = [
  {
    id: "photography",
    label: "Photography",
    color: "blue",
    accent: "#48b6ff",
    summary: "Portraits, street moments, beauty details, and editorial sets.",
    cta: "View image work",
    socialLabel: "Instagram",
    socialUrl: "https://instagram.com/",
    tags: ["portraits", "editorial", "street", "beauty"],
    posts: [
      {
        title: "Street Portrait Study",
        type: "Photo Set",
        date: "Placeholder",
        description: "Candid city styling, soft motion, and confident close-up framing.",
        tags: ["street", "portrait"],
        palette: ["#f3f0e8", "#202020", "#6ea6c6"],
        mediaUrl: "https://picsum.photos/seed/photography-street/900/1200.webp"
      },
      {
        title: "Beauty Detail Frames",
        type: "Photo Set",
        date: "Placeholder",
        description: "Clean detail shots designed for brows, skin texture, and service trust.",
        tags: ["beauty", "detail"],
        palette: ["#f8dfe8", "#6d7f5b", "#222222"],
        mediaUrl: "https://picsum.photos/seed/photography-beauty/900/1200.webp"
      },
      {
        title: "Editorial Contact Sheet",
        type: "Gallery",
        date: "Placeholder",
        description: "A magazine-style grid mixing portraits, captions, and visual rhythm.",
        tags: ["editorial", "layout"],
        palette: ["#ffffff", "#d01e29", "#1f5f9c"],
        mediaUrl: "https://picsum.photos/seed/photography-editorial/900/1200.webp"
      }
    ]
  },
  {
    id: "videography",
    label: "Videography",
    color: "green",
    accent: "#9dc56e",
    summary: "Short-form edits, mood reels, campaign clips, and platform-native cuts.",
    cta: "View video edits",
    socialLabel: "TikTok",
    socialUrl: "https://www.tiktok.com/",
    tags: ["reels", "editing", "campaigns", "motion"],
    posts: [
      {
        title: "Night Edit Reel",
        type: "Video",
        date: "Placeholder",
        description: "Fast cuts, handheld texture, and caption-led storytelling.",
        tags: ["reel", "night"],
        palette: ["#101010", "#d6f348", "#a62320"],
        mediaUrl: "https://picsum.photos/seed/video-night-edit/900/1200.webp"
      },
      {
        title: "Behind The Shot",
        type: "Video",
        date: "Placeholder",
        description: "Process-led content showing setup, detail, and the finished look.",
        tags: ["process", "editing"],
        palette: ["#e7e3d7", "#38566d", "#111111"],
        mediaUrl: "https://picsum.photos/seed/video-process/900/1200.webp"
      },
      {
        title: "Campaign Micro Cut",
        type: "Video",
        date: "Placeholder",
        description: "A concise social-first edit prepared for vertical viewing.",
        tags: ["campaign", "vertical"],
        palette: ["#eeeeee", "#4cc2f0", "#282828"],
        mediaUrl: "https://picsum.photos/seed/video-campaign/900/1200.webp"
      }
    ]
  },
  {
    id: "dance",
    label: "Dance",
    color: "pink",
    accent: "#f07291",
    summary: "Street dance, freestyle clips, choreography notes, and performance moments.",
    cta: "View movement",
    socialLabel: "TikTok",
    socialUrl: "https://www.tiktok.com/",
    tags: ["street dance", "freestyle", "performance", "movement"],
    posts: [
      {
        title: "Freestyle Session",
        type: "Clip",
        date: "Placeholder",
        description: "Movement-led content with texture, timing, and personality.",
        tags: ["freestyle", "street dance"],
        palette: ["#e9ecef", "#111111", "#f07291"],
        mediaUrl: "https://picsum.photos/seed/dance-freestyle/900/1200.webp"
      },
      {
        title: "Choreo Notes",
        type: "Clip",
        date: "Placeholder",
        description: "Short sequence edits for teaching, teasing, or documenting a routine.",
        tags: ["choreography", "routine"],
        palette: ["#f5c245", "#121212", "#5a95d6"],
        mediaUrl: "https://picsum.photos/seed/dance-choreo/900/1200.webp"
      },
      {
        title: "Performance Archive",
        type: "Archive",
        date: "Placeholder",
        description: "A curated collection of live, rehearsal, and social performance moments.",
        tags: ["performance", "archive"],
        palette: ["#342f4d", "#f6f0e6", "#d94f30"],
        mediaUrl: "https://picsum.photos/seed/dance-performance/900/1200.webp"
      }
    ]
  },
  {
    id: "brows",
    label: "Eyebrow Tattooing",
    color: "yellow",
    accent: "#f4c84a",
    summary: "Service positioning, healed results, consultation prompts, and booking readiness.",
    cta: "View brow work",
    socialLabel: "Instagram",
    socialUrl: "https://instagram.com/",
    tags: ["brows", "beauty", "consultation", "booking"],
    posts: [
      {
        title: "Brow Mapping Preview",
        type: "Service",
        date: "Placeholder",
        description: "A trust-building service card for mapping, consultation, and aftercare.",
        tags: ["consultation", "mapping"],
        palette: ["#fff7da", "#28231f", "#f4c84a"],
        mediaUrl: "https://picsum.photos/seed/brows-mapping/900/1200.webp"
      },
      {
        title: "Healed Results Placeholder",
        type: "Gallery",
        date: "Placeholder",
        description: "Reserved for client-approved before, after, and healed result imagery.",
        tags: ["results", "aftercare"],
        palette: ["#f4dfdc", "#7f5f56", "#111111"],
        mediaUrl: "https://picsum.photos/seed/brows-results/900/1200.webp"
      },
      {
        title: "Booking Prep",
        type: "Future",
        date: "Later Sprint",
        description: "Future Cal.com embed area for consultations and eyebrow tattoo bookings.",
        tags: ["booking", "future"],
        palette: ["#ffffff", "#f4c84a", "#4b4b4b"],
        mediaUrl: "https://picsum.photos/seed/brows-booking/900/1200.webp"
      }
    ]
  }
];

export const socialNotes = [
  "MVP uses curated local content for speed and reliability.",
  "Live Instagram feed work needs a Creator or Business account and current Meta API review.",
  "TikTok can be upgraded with official embeds for selected posts when real links are supplied."
];
