// Sample track catalog. Each track has a YouTube video ID for streaming
// and a flag indicating whether it's downloadable (only royalty-free / user uploads).
export interface Track {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  videoId?: string; // YouTube video ID (for streaming)
  audioUrl?: string; // Direct audio URL (for uploaded / royalty-free)
  duration?: string;
  downloadable?: boolean;
  source: 'youtube' | 'upload' | 'royalty-free';
}

// Curated YouTube tracks (for streaming via embedded player only - no downloads).
export const sampleTracks: Track[] = [
  {
    id: 'yt-1',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    thumbnail: 'https://i.ytimg.com/vi/4NRXx6U8ABQ/hqdefault.jpg',
    videoId: '4NRXx6U8ABQ',
    duration: '3:20',
    source: 'youtube',
    downloadable: false,
  },
  {
    id: 'yt-2',
    title: 'Shape of You',
    artist: 'Ed Sheeran',
    thumbnail: 'https://i.ytimg.com/vi/JGwWNGJdvx8/hqdefault.jpg',
    videoId: 'JGwWNGJdvx8',
    duration: '3:53',
    source: 'youtube',
    downloadable: false,
  },
  {
    id: 'yt-3',
    title: 'Levitating',
    artist: 'Dua Lipa',
    thumbnail: 'https://i.ytimg.com/vi/TUVcZfQe-Kw/hqdefault.jpg',
    videoId: 'TUVcZfQe-Kw',
    duration: '3:23',
    source: 'youtube',
    downloadable: false,
  },
  {
    id: 'yt-4',
    title: 'Watermelon Sugar',
    artist: 'Harry Styles',
    thumbnail: 'https://i.ytimg.com/vi/E07s5ZYygMg/hqdefault.jpg',
    videoId: 'E07s5ZYygMg',
    duration: '2:54',
    source: 'youtube',
    downloadable: false,
  },
  {
    id: 'yt-5',
    title: 'Bad Guy',
    artist: 'Billie Eilish',
    thumbnail: 'https://i.ytimg.com/vi/DyDfgMOUjCI/hqdefault.jpg',
    videoId: 'DyDfgMOUjCI',
    duration: '3:14',
    source: 'youtube',
    downloadable: false,
  },
  {
    id: 'yt-6',
    title: 'Stay',
    artist: 'The Kid LAROI, Justin Bieber',
    thumbnail: 'https://i.ytimg.com/vi/kTJczUoc26U/hqdefault.jpg',
    videoId: 'kTJczUoc26U',
    duration: '2:21',
    source: 'youtube',
    downloadable: false,
  },
  {
    id: 'yt-7',
    title: 'As It Was',
    artist: 'Harry Styles',
    thumbnail: 'https://i.ytimg.com/vi/H5v3kku4y6Q/hqdefault.jpg',
    videoId: 'H5v3kku4y6Q',
    duration: '2:47',
    source: 'youtube',
    downloadable: false,
  },
  {
    id: 'yt-8',
    title: 'Heat Waves',
    artist: 'Glass Animals',
    thumbnail: 'https://i.ytimg.com/vi/mRD0-GxqHVo/hqdefault.jpg',
    videoId: 'mRD0-GxqHVo',
    duration: '3:58',
    source: 'youtube',
    downloadable: false,
  },
  {
    id: 'yt-9',
    title: 'Anti-Hero',
    artist: 'Taylor Swift',
    thumbnail: 'https://i.ytimg.com/vi/b1kbLwvqugk/hqdefault.jpg',
    videoId: 'b1kbLwvqugk',
    duration: '3:20',
    source: 'youtube',
    downloadable: false,
  },
  {
    id: 'yt-10',
    title: 'Flowers',
    artist: 'Miley Cyrus',
    thumbnail: 'https://i.ytimg.com/vi/G7KNmW9a75Y/hqdefault.jpg',
    videoId: 'G7KNmW9a75Y',
    duration: '3:20',
    source: 'youtube',
    downloadable: false,
  },
  {
    id: 'yt-11',
    title: 'Unholy',
    artist: 'Sam Smith, Kim Petras',
    thumbnail: 'https://i.ytimg.com/vi/Uq9gPaIzbe8/hqdefault.jpg',
    videoId: 'Uq9gPaIzbe8',
    duration: '2:36',
    source: 'youtube',
    downloadable: false,
  },
  {
    id: 'yt-12',
    title: 'Calm Down',
    artist: 'Rema, Selena Gomez',
    thumbnail: 'https://i.ytimg.com/vi/WcIcVapfqXw/hqdefault.jpg',
    videoId: 'WcIcVapfqXw',
    duration: '3:59',
    source: 'youtube',
    downloadable: false,
  },
];

// Royalty-free / public-domain catalog. These are downloadable for offline use.
// (Sample CC-licensed tracks from public sources.)
export const royaltyFreeTracks: Track[] = [
  {
    id: 'rf-1',
    title: 'Sunny Afternoon',
    artist: 'Free Music Archive',
    thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    duration: '6:11',
    source: 'royalty-free',
    downloadable: true,
  },
  {
    id: 'rf-2',
    title: 'Midnight Drive',
    artist: 'SoundHelix',
    thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    duration: '5:13',
    source: 'royalty-free',
    downloadable: true,
  },
  {
    id: 'rf-3',
    title: 'Ocean Breeze',
    artist: 'Public Domain',
    thumbnail: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    duration: '5:30',
    source: 'royalty-free',
    downloadable: true,
  },
  {
    id: 'rf-4',
    title: 'Acoustic Dreams',
    artist: 'Free Music Archive',
    thumbnail: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    duration: '4:53',
    source: 'royalty-free',
    downloadable: true,
  },
  {
    id: 'rf-5',
    title: 'Electric Pulse',
    artist: 'Creative Commons',
    thumbnail: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    duration: '5:40',
    source: 'royalty-free',
    downloadable: true,
  },
  {
    id: 'rf-6',
    title: 'City Lights',
    artist: 'Royalty Free',
    thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    duration: '4:42',
    source: 'royalty-free',
    downloadable: true,
  },
];

export const allTracks: Track[] = [...sampleTracks, ...royaltyFreeTracks];
