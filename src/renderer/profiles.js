

export const PRESET_LIBRARY = {
  cinematic: {
    name: "Grand Theatre",
    eq: "20 4; 80 2; 250 -2; 1000 0; 4000 2; 8000 3.5; 16000 1.5",
    bass: 65,
    treble: 60,
    clarity: 70,
    spatial: true
  },
  gaming: {
    name: "E-Sports Spatial",
    eq: "100 -5; 250 -2; 1000 1; 2500 6; 4000 4; 8000 2; 16000 0",
    bass: 40,
    treble: 75,
    clarity: 85,
    spatial: true
  },
  vocal: {
    name: "Podcast Pro",
    eq: "80 -3; 150 2; 500 0; 1000 3; 3000 4.5; 6000 2; 12000 0",
    bass: 45,
    treble: 50,
    clarity: 90,
    spatial: false
  },
  studio: {
    name: "Reference Flat",
    eq: "32 0; 1000 0; 16000 0",
    bass: 50,
    treble: 50,
    clarity: 50,
    spatial: false
  }
};