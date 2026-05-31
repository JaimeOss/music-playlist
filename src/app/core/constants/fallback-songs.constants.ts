import { Song } from '../models/song.model';

/** Catálogo local de respaldo (20 canciones con preview de iTunes embebido en la app). */
export const FALLBACK_SONGS: Song[] = [
  {
    id: '1544491998',
    title: 'Someone Like You',
    artist: 'Adele',
    duration: 285240,
    cover:
      'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/eb/ca/25/ebca2596-cd1e-b295-91a3-771c868d0a79/191404113868.png/600x600bb.jpg',
    previewUrl:
      'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/ef/18/7b/ef187b7d-f487-e935-4ca1-af5748313710/mzaf_8455263230305249048.plus.aac.p.m4a',
  },
  {
    id: '1544491988',
    title: 'Set Fire to the Rain',
    artist: 'Adele',
    duration: 242974,
    cover:
      'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/eb/ca/25/ebca2596-cd1e-b295-91a3-771c868d0a79/191404113868.png/600x600bb.jpg',
    previewUrl:
      'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/81/19/83/811983ba-173c-84f4-4058-fae8340abcdf/mzaf_13432775834568786807.plus.aac.p.m4a',
  },
  {
    id: '1544491233',
    title: 'Rolling in the Deep',
    artist: 'Adele',
    duration: 228093,
    cover:
      'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/eb/ca/25/ebca2596-cd1e-b295-91a3-771c868d0a79/191404113868.png/600x600bb.jpg',
    previewUrl:
      'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/9f/07/1d/9f071dc7-791c-c869-dfa2-06b25936a287/mzaf_11077490630806345321.plus.aac.p.m4a',
  },
  {
    id: '1538003843',
    title: 'Levitating',
    artist: 'Dua Lipa',
    duration: 203808,
    cover:
      'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/6c/11/d6/6c11d681-aa3a-d59e-4c2e-f77e181026ab/190295092665.jpg/600x600bb.jpg',
    previewUrl:
      'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/59/dc/4d/59dc4dda-93ff-8f1c-c536-f005f6ea6af5/mzaf_3066686759813252385.plus.aac.p.m4a',
  },
  {
    id: '1228739609',
    title: 'New Rules',
    artist: 'Dua Lipa',
    duration: 209320,
    cover:
      'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/c1/54/2d/c1542d45-c6c2-12ca-7308-6eacd762c562/190295807870.jpg/600x600bb.jpg',
    previewUrl:
      'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/6e/19/d9/6e19d9ca-1321-1eea-e797-51d7ab5b56c2/mzaf_5898999508314966855.plus.aac.p.m4a',
  },
  {
    id: '1689238922',
    title: 'Dance The Night',
    artist: 'Dua Lipa',
    duration: 176579,
    cover:
      'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/c0/54/97/c05497aa-c19f-bf4f-de29-71edf30fbefb/075679688767.jpg/600x600bb.jpg',
    previewUrl:
      'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/9d/9f/56/9d9f566f-abf6-5f10-bcdb-09e14dcace42/mzaf_10277018989080903908.plus.aac.p.m4a',
  },
  {
    id: '1122782283',
    title: 'Yellow',
    artist: 'Coldplay',
    duration: 269208,
    cover:
      'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/f5/93/8c/f5938c49-964c-31d1-4b33-78b634f71fb7/190295978075.jpg/600x600bb.jpg',
    previewUrl:
      'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/66/f3/1a/66f31a76-a6ed-cb4c-f353-23310a7ae9a8/mzaf_10593596652344378873.plus.aac.p.m4a',
  },
  {
    id: '1122773680',
    title: 'Viva La Vida',
    artist: 'Coldplay',
    duration: 241445,
    cover:
      'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/52/aa/85/52aa851f-15b7-6322-f91f-df84b15b7b19/190295978044.jpg/600x600bb.jpg',
    previewUrl:
      'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/2b/04/65/2b0465c3-2db1-e461-2362-14b528456b8f/mzaf_1805426141027060154.plus.aac.p.m4a',
  },
  {
    id: '829910927',
    title: 'A Sky Full of Stars',
    artist: 'Coldplay',
    duration: 268466,
    cover:
      'https://is1-ssl.mzstatic.com/image/thumb/Features125/v4/60/90/ad/6090adc3-8863-861d-afcc-23c55c6fe5da/dj.vmtulfyu.jpg/600x600bb.jpg',
    previewUrl:
      'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/a2/31/4b/a2314b97-10b6-190c-72b3-45cc21bbf56b/mzaf_740612971315603868.plus.aac.p.m4a',
  },
  {
    id: '1193701400',
    title: 'Perfect',
    artist: 'Ed Sheeran',
    duration: 263400,
    cover:
      'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/600x600bb.jpg',
    previewUrl:
      'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/c7/ba/bc/c7babc66-f598-aaa6-bcf6-307281795817/mzaf_16337361235117168274.plus.aac.p.m4a',
  },
  {
    id: '1050204631',
    title: 'Thinking Out Loud',
    artist: 'Ed Sheeran',
    duration: 281560,
    cover:
      'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/2d/36/f9/2d36f9a7-2c3e-ce0f-7fb6-036feecb221f/825646974450.jpg/600x600bb.jpg',
    previewUrl:
      'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/78/a5/f2/78a5f25e-ad1b-718d-82ad-b82e676c1855/mzaf_6133970271589343093.plus.aac.p.m4a',
  },
  {
    id: '1193701392',
    title: 'Shape of You',
    artist: 'Ed Sheeran',
    duration: 233713,
    cover:
      'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/600x600bb.jpg',
    previewUrl:
      'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/44/c7/4f/44c74f0d-72dc-6143-d4d0-ba14d661ca0d/mzaf_9566898362556366703.plus.aac.p.m4a',
  },
  {
    id: '1739659144',
    title: 'WILDFLOWER',
    artist: 'Billie Eilish',
    duration: 261467,
    cover:
      'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/92/9f/69/929f69f1-9977-3a44-d674-11f70c852d1b/24UMGIM36186.rgb.jpg/600x600bb.jpg',
    previewUrl:
      'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/de/c3/e8/dec3e884-7237-9622-718a-12c5f48c5ca2/mzaf_3134455671785145822.plus.aac.p.m4a',
  },
  {
    id: '1739659142',
    title: 'BIRDS OF A FEATHER',
    artist: 'Billie Eilish',
    duration: 210373,
    cover:
      'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/92/9f/69/929f69f1-9977-3a44-d674-11f70c852d1b/24UMGIM36186.rgb.jpg/600x600bb.jpg',
    previewUrl:
      'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/34/31/d3/3431d34e-847f-5d66-df83-0bce688d997e/mzaf_18106743962423782018.plus.aac.p.m4a',
  },
  {
    id: '1440899467',
    title: 'ocean eyes',
    artist: 'Billie Eilish',
    duration: 200379,
    cover:
      'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/02/1d/30/021d3036-5503-3ed3-df00-882f2833a6ae/17UM1IM17026.rgb.jpg/600x600bb.jpg',
    previewUrl:
      'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/d6/59/2b/d6592b0b-1e7e-4743-b2e4-f2af038fd783/mzaf_7697277787797935735.plus.aac.p.m4a',
  },
  {
    id: '1833328840',
    title: 'The Fate of Ophelia',
    artist: 'Taylor Swift',
    duration: 226074,
    cover:
      'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/2d/46/e0/2d46e0bc-8ab9-85dd-4b56-ee6951351034/25UM1IM19577.rgb.jpg/600x600bb.jpg',
    previewUrl:
      'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/4b/07/28/4b07285f-b50c-7aff-cb40-2d732256b703/mzaf_16739866530441939982.plus.aac.p.m4a',
  },
  {
    id: '1440936016',
    title: 'Shake It Off',
    artist: 'Taylor Swift',
    duration: 219209,
    cover:
      'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/89/4a/4a/894a4ab9-b0b0-9ea5-ca41-8da0b9b79453/14UMDIM03405.rgb.jpg/600x600bb.jpg',
    previewUrl:
      'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/04/86/32/048632f7-a5c5-0f5d-6213-a9e89c3a99b3/mzaf_8458239339293825693.plus.aac.p.m4a',
  },
  {
    id: '1468058171',
    title: 'Cruel Summer',
    artist: 'Taylor Swift',
    duration: 178426,
    cover:
      'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/49/3d/ab/493dab54-f920-9043-6181-80993b8116c9/19UMGIM53909.rgb.jpg/600x600bb.jpg',
    previewUrl:
      'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/44/af/81/44af8168-9609-1b85-5048-ada08dceacf3/mzaf_1341699644335558812.plus.aac.p.m4a',
  },
  {
    id: '1866732797',
    title: 'Risk It All',
    artist: 'Bruno Mars',
    duration: 204068,
    cover:
      'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/ed/46/bf/ed46bf4e-7cb9-965a-54f3-03059977fe6c/075679589293.jpg/600x600bb.jpg',
    previewUrl:
      'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/61/fc/d7/61fcd7e8-ea20-2f90-3672-09516cd050e6/mzaf_12696195794831485731.plus.aac.p.m4a',
  },
  {
    id: '1866732800',
    title: 'I Just Might',
    artist: 'Bruno Mars',
    duration: 212974,
    cover:
      'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/ed/46/bf/ed46bf4e-7cb9-965a-54f3-03059977fe6c/075679589293.jpg/600x600bb.jpg',
    previewUrl:
      'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/86/ef/58/86ef584b-cb46-43df-12e3-fce4b436688c/mzaf_10081886156675578892.plus.aac.p.m4a',
  },
];
