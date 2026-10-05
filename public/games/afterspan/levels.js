(function(root){'use strict';
const ROOMS=[
 {
  "name": "The long way up",
  "zone": "ARRIVAL DECK",
  "hint": "A / D 或方向键移动 · 空格跳跃 · Q 切换 2076 / 2091，第一关即可尝试。",
  "note": "SURVEY 091 / ALL UPPER GANTRIES UNRESPONSIVE",
  "spawn": [
   70,
   492
  ],
  "exit": {
   "x": 1010,
   "y": 462,
   "w": 34,
   "h": 58
  },
  "shift": true,
  "solids": [
   {
    "x": 0,
    "y": 520,
    "w": 1120,
    "h": 80,
    "mask": 3
   },
   {
    "x": 265,
    "y": 475,
    "w": 105,
    "h": 45,
    "mask": 3
   },
   {
    "x": 465,
    "y": 430,
    "w": 110,
    "h": 90,
    "mask": 3
   },
   {
    "x": 685,
    "y": 475,
    "w": 110,
    "h": 45,
    "mask": 3
   }
  ],
  "hazards": [],
  "id": "aer-01",
  "section": 0
 },
 {
  "name": "A wall that was not",
  "zone": "QUARANTINE",
  "hint": "Q shifts fifteen years. The sealed wall exists only in the present. Dotted outlines belong to the other era.",
  "note": "CONTAINMENT WALL / INSTALLED 2077",
  "spawn": [
   70,
   492
  ],
  "exit": {
   "x": 1010,
   "y": 462,
   "w": 34,
   "h": 58
  },
  "shift": true,
  "solids": [
   {
    "x": 0,
    "y": 520,
    "w": 1120,
    "h": 80,
    "mask": 3
   },
   {
    "x": 480,
    "y": 0,
    "w": 38,
    "h": 520,
    "mask": 1
   }
  ],
  "hazards": [],
  "id": "aer-02",
  "section": 0
 },
 {
  "name": "Trust the missing span",
  "zone": "TRANSIT BRIDGE",
  "hint": "The bridge collapsed. Press Q to restore it, then jump the short gaps at either end.",
  "note": "LAST SERVICE / 15 YEARS AGO",
  "spawn": [
   130,
   492
  ],
  "exit": {
   "x": 1010,
   "y": 462,
   "w": 34,
   "h": 58
  },
  "shift": true,
  "solids": [
   {
    "x": 0,
    "y": 520,
    "w": 250,
    "h": 80,
    "mask": 3
   },
   {
    "x": 295,
    "y": 490,
    "w": 410,
    "h": 20,
    "mask": 2
   },
   {
    "x": 760,
    "y": 520,
    "w": 360,
    "h": 80,
    "mask": 3
   }
  ],
  "hazards": [],
  "id": "aer-03",
  "section": 0
 },
 {
  "name": "A step into yesterday",
  "zone": "OBSERVATION",
  "hint": "Jump from a blue ledge, then Q in the air to land on amber. Your momentum stays with you.",
  "note": "OBSERVATION WINDOW / PHASE DRIFT: 0.003",
  "spawn": [
   70,
   492
  ],
  "exit": {
   "x": 1035,
   "y": 402,
   "w": 34,
   "h": 58
  },
  "shift": true,
  "solids": [
   {
    "x": 0,
    "y": 520,
    "w": 220,
    "h": 80,
    "mask": 3
   },
   {
    "x": 205,
    "y": 450,
    "w": 95,
    "h": 18,
    "mask": 1
   },
   {
    "x": 345,
    "y": 390,
    "w": 125,
    "h": 18,
    "mask": 2
   },
   {
    "x": 510,
    "y": 335,
    "w": 130,
    "h": 18,
    "mask": 1
   },
   {
    "x": 700,
    "y": 395,
    "w": 135,
    "h": 18,
    "mask": 2
   },
   {
    "x": 910,
    "y": 460,
    "w": 210,
    "h": 140,
    "mask": 3
   }
  ],
  "hazards": [],
  "id": "aer-04",
  "section": 0
 },
 {
  "name": "Hold the edge",
  "zone": "SERVICE SHAFT",
  "hint": "Hold toward a wall to slide. Tap SPACE to kick away, then steer back. The second wall survives only in the past.",
  "note": "SERVICE ACCESS / KEEP BOTH HANDS FREE",
  "spawn": [
   65,
   492
  ],
  "exit": {
   "x": 1040,
   "y": 227,
   "w": 34,
   "h": 58
  },
  "shift": true,
  "solids": [
   {
    "x": 0,
    "y": 520,
    "w": 1120,
    "h": 80,
    "mask": 3
   },
   {
    "x": 310,
    "y": 350,
    "w": 32,
    "h": 170,
    "mask": 3
   },
   {
    "x": 180,
    "y": 410,
    "w": 90,
    "h": 18,
    "mask": 3
   },
   {
    "x": 470,
    "y": 300,
    "w": 115,
    "h": 18,
    "mask": 3
   },
   {
    "x": 675,
    "y": 300,
    "w": 34,
    "h": 220,
    "mask": 2
   },
   {
    "x": 860,
    "y": 285,
    "w": 260,
    "h": 315,
    "mask": 3
   }
  ],
  "hazards": [],
  "id": "aer-05",
  "section": 1
 },
 {
  "name": "Leave the wall behind",
  "zone": "PHASE CHAMBER",
  "hint": "Q to reach the amber wall. Wall-jump away, then Q to catch the blue ledge. Climb across the changing route.",
  "note": "FIELD LOG / THE ECHO ARRIVED BEFORE THE SIGNAL",
  "spawn": [
   80,
   472
  ],
  "exit": {
   "x": 1040,
   "y": 382,
   "w": 34,
   "h": 58
  },
  "shift": true,
  "solids": [
   {
    "x": 0,
    "y": 500,
    "w": 225,
    "h": 100,
    "mask": 3
   },
   {
    "x": 340,
    "y": 385,
    "w": 28,
    "h": 215,
    "mask": 2
   },
   {
    "x": 200,
    "y": 355,
    "w": 110,
    "h": 18,
    "mask": 1
   },
   {
    "x": 375,
    "y": 310,
    "w": 145,
    "h": 18,
    "mask": 1
   },
   {
    "x": 590,
    "y": 375,
    "w": 135,
    "h": 18,
    "mask": 2
   },
   {
    "x": 825,
    "y": 440,
    "w": 295,
    "h": 160,
    "mask": 3
   }
  ],
  "hazards": [],
  "id": "aer-06",
  "section": 1
 },
 {
  "name": "The vanishing floor",
  "zone": "RETURN CHANNEL",
  "hint": "Begin in the past. Jump and Q to drop through the amber floor; Q again to catch the lower amber landing.",
  "spawn": [
   150,
   272
  ],
  "exit": {
   "x": 1035,
   "y": 462,
   "w": 34,
   "h": 58
  },
  "solids": [
   {
    "x": 60,
    "y": 300,
    "w": 280,
    "h": 18,
    "mask": 2
   },
   {
    "x": 0,
    "y": 320,
    "w": 160,
    "h": 18,
    "mask": 3
   },
   {
    "x": 310,
    "y": 320,
    "w": 130,
    "h": 18,
    "mask": 3
   },
   {
    "x": 170,
    "y": 465,
    "w": 150,
    "h": 18,
    "mask": 2
   },
   {
    "x": 400,
    "y": 405,
    "w": 140,
    "h": 18,
    "mask": 1
   },
   {
    "x": 620,
    "y": 455,
    "w": 150,
    "h": 18,
    "mask": 2
   },
   {
    "x": 880,
    "y": 520,
    "w": 240,
    "h": 80,
    "mask": 3
   }
  ],
  "hazards": [],
  "shift": true,
  "startTimeline": 1,
  "id": "aer-07",
  "section": 2,
  "note": "AER / RETURN CHANNEL"
 },
 {
  "name": "Through the seam",
  "zone": "EMERGENCY SEAL",
  "hint": "Jump toward the blue wall and Q before contact. Catch the amber ledge, then switch back to reach the next blue one.",
  "spawn": [
   90,
   492
  ],
  "exit": {
   "x": 1040,
   "y": 462,
   "w": 34,
   "h": 58
  },
  "solids": [
   {
    "x": 0,
    "y": 520,
    "w": 250,
    "h": 80,
    "mask": 3
   },
   {
    "x": 295,
    "y": 0,
    "w": 24,
    "h": 560,
    "mask": 1
   },
   {
    "x": 350,
    "y": 475,
    "w": 135,
    "h": 18,
    "mask": 2
   },
   {
    "x": 545,
    "y": 425,
    "w": 125,
    "h": 18,
    "mask": 1
   },
   {
    "x": 730,
    "y": 470,
    "w": 130,
    "h": 18,
    "mask": 2
   },
   {
    "x": 930,
    "y": 520,
    "w": 190,
    "h": 80,
    "mask": 3
   }
  ],
  "hazards": [
   {
    "x": 975,
    "y": 506,
    "w": 48,
    "h": 14,
    "mask": 3
   }
  ],
  "shift": true,
  "id": "aer-08",
  "section": 2,
  "note": "AER / EMERGENCY SEAL"
 },
 {
  "name": "Find the rhythm",
  "zone": "TURBINE WALK",
  "hint": "Alternate amber and blue. Striped ledges fall after a moment; the amber carriage moves on a fixed cycle.",
  "spawn": [
   65,
   492
  ],
  "exit": {
   "x": 1050,
   "y": 382,
   "w": 34,
   "h": 58
  },
  "solids": [
   {
    "x": 0,
    "y": 520,
    "w": 170,
    "h": 80,
    "mask": 3
   },
   {
    "x": 235,
    "y": 460,
    "w": 110,
    "h": 18,
    "mask": 2
   },
   {
    "x": 420,
    "y": 400,
    "w": 110,
    "h": 18,
    "mask": 1,
    "crumble": true,
    "delay": 0.6
   },
   {
    "x": 615,
    "y": 435,
    "w": 135,
    "h": 18,
    "mask": 2,
    "move": {
     "x": 20,
     "y": 0,
     "speed": 1.15,
     "phase": 0
    }
   },
   {
    "x": 820,
    "y": 380,
    "w": 110,
    "h": 18,
    "mask": 1,
    "crumble": true,
    "delay": 0.6
   },
   {
    "x": 985,
    "y": 440,
    "w": 135,
    "h": 160,
    "mask": 3
   }
  ],
  "hazards": [
   {
    "x": 515,
    "y": 505,
    "w": 34,
    "h": 34,
    "mask": 1,
    "kind": "saw",
    "move": {
     "x": 45,
     "y": 0,
     "speed": 1.4
    }
   }
  ],
  "shift": true,
  "id": "aer-09",
  "section": 2,
  "note": "AER / TURBINE WALK"
 },
 {
  "name": "The moment between",
  "zone": "UPPER ARCHIVE",
  "hint": "Amber foothold → wall jump → blue ledge. Jump past the amber partition, then Q to catch the landing beyond it.",
  "spawn": [
   60,
   492
  ],
  "exit": {
   "x": 1060,
   "y": 332,
   "w": 34,
   "h": 58
  },
  "solids": [
   {
    "x": 0,
    "y": 520,
    "w": 175,
    "h": 80,
    "mask": 3
   },
   {
    "x": 230,
    "y": 455,
    "w": 115,
    "h": 18,
    "mask": 2
   },
   {
    "x": 420,
    "y": 335,
    "w": 28,
    "h": 265,
    "mask": 2
   },
   {
    "x": 300,
    "y": 345,
    "w": 95,
    "h": 18,
    "mask": 1
   },
   {
    "x": 485,
    "y": 305,
    "w": 135,
    "h": 18,
    "mask": 1
   },
   {
    "x": 660,
    "y": 0,
    "w": 22,
    "h": 405,
    "mask": 2
   },
   {
    "x": 725,
    "y": 365,
    "w": 115,
    "h": 18,
    "mask": 2
   },
   {
    "x": 895,
    "y": 320,
    "w": 90,
    "h": 18,
    "mask": 1,
    "crumble": true,
    "delay": 0.6
   },
   {
    "x": 1010,
    "y": 390,
    "w": 110,
    "h": 210,
    "mask": 3
   }
  ],
  "hazards": [
   {
    "x": 550,
    "y": 430,
    "w": 34,
    "h": 34,
    "mask": 2,
    "kind": "saw",
    "move": {
     "x": 38,
     "y": 0,
     "speed": 1.3
    }
   }
  ],
  "shift": true,
  "id": "aer-10",
  "section": 2,
  "note": "AER / UPPER ARCHIVE"
 },
 {
  "name": "The alternating ascent",
  "zone": "A / ALTERNATING PLATFORMS",
  "hint": "Follow the rising footholds. Jump → Q → land. At the far wall the route turns back to the left.",
  "spawn": [
   150,
   1002
  ],
  "exit": {
   "x": 700,
   "y": 137,
   "w": 34,
   "h": 58
  },
  "solids": [
   {
    "x": 80,
    "y": 1030,
    "w": 200,
    "h": 90,
    "mask": 3
   },
   {
    "x": 315,
    "y": 960,
    "w": 115,
    "h": 18,
    "mask": 1
   },
   {
    "x": 480,
    "y": 890,
    "w": 115,
    "h": 18,
    "mask": 2
   },
   {
    "x": 645,
    "y": 820,
    "w": 115,
    "h": 18,
    "mask": 1
   },
   {
    "x": 810,
    "y": 750,
    "w": 115,
    "h": 18,
    "mask": 2
   },
   {
    "x": 960,
    "y": 680,
    "w": 115,
    "h": 18,
    "mask": 1
   },
   {
    "x": 795,
    "y": 610,
    "w": 115,
    "h": 18,
    "mask": 2
   },
   {
    "x": 630,
    "y": 540,
    "w": 115,
    "h": 18,
    "mask": 1
   },
   {
    "x": 465,
    "y": 470,
    "w": 115,
    "h": 18,
    "mask": 2
   },
   {
    "x": 300,
    "y": 400,
    "w": 115,
    "h": 18,
    "mask": 1
   },
   {
    "x": 135,
    "y": 330,
    "w": 115,
    "h": 18,
    "mask": 2
   },
   {
    "x": 300,
    "y": 260,
    "w": 115,
    "h": 18,
    "mask": 1
   },
   {
    "x": 475,
    "y": 195,
    "w": 115,
    "h": 18,
    "mask": 2
   },
   {
    "x": 650,
    "y": 195,
    "w": 150,
    "h": 18,
    "mask": 3
   }
  ],
  "hazards": [],
  "shift": true,
  "height": 1120,
  "id": "aer-11",
  "section": 3,
  "note": "AER / A / ALTERNATING PLATFORMS"
 },
 {
  "name": "Twice in one breath",
  "zone": "B / DOUBLE SHIFT",
  "hint": "Launch from blue. Change to amber before the partition; change back for the blue landing. Carry the rhythm across.",
  "spawn": [
   75,
   492
  ],
  "exit": {
   "x": 1040,
   "y": 402,
   "w": 34,
   "h": 58
  },
  "solids": [
   {
    "x": 0,
    "y": 520,
    "w": 225,
    "h": 80,
    "mask": 1
   },
   {
    "x": 290,
    "y": 0,
    "w": 22,
    "h": 550,
    "mask": 1
   },
   {
    "x": 360,
    "y": 450,
    "w": 130,
    "h": 18,
    "mask": 2
   },
   {
    "x": 530,
    "y": 0,
    "w": 22,
    "h": 520,
    "mask": 2
   },
   {
    "x": 590,
    "y": 390,
    "w": 130,
    "h": 18,
    "mask": 1
   },
   {
    "x": 790,
    "y": 450,
    "w": 120,
    "h": 18,
    "mask": 2
   },
   {
    "x": 1000,
    "y": 460,
    "w": 120,
    "h": 140,
    "mask": 1
   }
  ],
  "hazards": [],
  "shift": true,
  "id": "aer-12",
  "section": 3,
  "note": "AER / B / DOUBLE SHIFT"
 },
 {
  "name": "Walls across time",
  "zone": "C / SPLIT SHAFT",
  "hint": "Amber on the left, blue on the right. Kick away, switch, catch the opposite wall. Near the top, switch to blue and leave through the left wall.",
  "spawn": [
   470,
   972
  ],
  "exit": {
   "x": 265,
   "y": 222,
   "w": 34,
   "h": 58
  },
  "solids": [
   {
    "x": 340,
    "y": 1000,
    "w": 300,
    "h": 40,
    "mask": 3
   },
   {
    "x": 370,
    "y": 730,
    "w": 28,
    "h": 270,
    "mask": 2
   },
   {
    "x": 370,
    "y": 370,
    "w": 28,
    "h": 300,
    "mask": 2
   },
   {
    "x": 370,
    "y": 190,
    "w": 28,
    "h": 120,
    "mask": 2
   },
   {
    "x": 570,
    "y": 570,
    "w": 28,
    "h": 430,
    "mask": 1
   },
   {
    "x": 570,
    "y": 190,
    "w": 28,
    "h": 320,
    "mask": 1
   },
   {
    "x": 220,
    "y": 280,
    "w": 145,
    "h": 18,
    "mask": 3
   }
  ],
  "hazards": [],
  "shift": true,
  "height": 1040,
  "id": "aer-13",
  "section": 3,
  "note": "AER / C / SPLIT SHAFT"
 },
 {
  "name": "Below the surface",
  "zone": "D / FLOOR DROP",
  "hint": "Walk above the opening, then jump and Q. Fall through; Q back to amber before the lower catch. Follow the descending ledges.",
  "spawn": [
   180,
   232
  ],
  "exit": {
   "x": 950,
   "y": 792,
   "w": 34,
   "h": 58
  },
  "solids": [
   {
    "x": 80,
    "y": 260,
    "w": 480,
    "h": 18,
    "mask": 2
   },
   {
    "x": 0,
    "y": 285,
    "w": 350,
    "h": 18,
    "mask": 3
   },
   {
    "x": 500,
    "y": 285,
    "w": 620,
    "h": 18,
    "mask": 3
   },
   {
    "x": 300,
    "y": 303,
    "w": 28,
    "h": 370,
    "mask": 3
   },
   {
    "x": 555,
    "y": 303,
    "w": 28,
    "h": 370,
    "mask": 3
   },
   {
    "x": 365,
    "y": 540,
    "w": 140,
    "h": 18,
    "mask": 2
   },
   {
    "x": 590,
    "y": 620,
    "w": 135,
    "h": 18,
    "mask": 1
   },
   {
    "x": 785,
    "y": 690,
    "w": 130,
    "h": 18,
    "mask": 2
   },
   {
    "x": 590,
    "y": 760,
    "w": 135,
    "h": 18,
    "mask": 1
   },
   {
    "x": 800,
    "y": 850,
    "w": 280,
    "h": 100,
    "mask": 3
   }
  ],
  "hazards": [],
  "shift": true,
  "height": 950,
  "startTimeline": 1,
  "id": "aer-14",
  "section": 3,
  "note": "AER / D / FLOOR DROP"
 },
 {
  "name": "Do not lose the thread",
  "zone": "E / CONTINUOUS CHAIN",
  "hint": "Amber foothold → wall jump → blue shelf. Let that shelf disappear beneath you, catch amber below, then jump onward.",
  "spawn": [
   65,
   492
  ],
  "exit": {
   "x": 1035,
   "y": 267,
   "w": 34,
   "h": 58
  },
  "solids": [
   {
    "x": 0,
    "y": 520,
    "w": 170,
    "h": 80,
    "mask": 3
   },
   {
    "x": 245,
    "y": 455,
    "w": 110,
    "h": 18,
    "mask": 2,
    "crumble": true,
    "delay": 0.65
   },
   {
    "x": 425,
    "y": 330,
    "w": 28,
    "h": 270,
    "mask": 2
   },
   {
    "x": 315,
    "y": 345,
    "w": 100,
    "h": 18,
    "mask": 1,
    "crumble": true,
    "delay": 0.65
   },
   {
    "x": 500,
    "y": 300,
    "w": 125,
    "h": 18,
    "mask": 1
   },
   {
    "x": 510,
    "y": 440,
    "w": 145,
    "h": 18,
    "mask": 2,
    "crumble": true,
    "delay": 0.65
   },
   {
    "x": 680,
    "y": 0,
    "w": 22,
    "h": 395,
    "mask": 2
   },
   {
    "x": 735,
    "y": 385,
    "w": 125,
    "h": 18,
    "mask": 1,
    "crumble": true,
    "delay": 0.65
   },
   {
    "x": 950,
    "y": 325,
    "w": 140,
    "h": 18,
    "mask": 2
   }
  ],
  "hazards": [],
  "shift": true,
  "id": "aer-15",
  "section": 3,
  "note": "AER / E / CONTINUOUS CHAIN"
 },
 {
  "name": "A moving memory",
  "zone": "F / SINGLE CARRIAGE",
  "hint": "Catch the amber carriage and ride its rise. Jump at the upper part of its cycle; Q to catch the blue ledge.",
  "spawn": [
   65,
   492
  ],
  "exit": {
   "x": 1040,
   "y": 242,
   "w": 34,
   "h": 58
  },
  "solids": [
   {
    "x": 0,
    "y": 520,
    "w": 180,
    "h": 80,
    "mask": 3
   },
   {
    "x": 275,
    "y": 475,
    "w": 135,
    "h": 18,
    "mask": 2,
    "move": {
     "x": 65,
     "y": -40,
     "speed": 0.7,
     "phase": 0
    }
   },
   {
    "x": 500,
    "y": 375,
    "w": 140,
    "h": 18,
    "mask": 1
   },
   {
    "x": 725,
    "y": 330,
    "w": 135,
    "h": 18,
    "mask": 2,
    "move": {
     "x": 20,
     "y": 25,
     "speed": 0.85,
     "phase": 1
    }
   },
   {
    "x": 965,
    "y": 300,
    "w": 155,
    "h": 300,
    "mask": 1
   }
  ],
  "hazards": [],
  "shift": true,
  "id": "aer-16",
  "section": 4,
  "note": "AER / F / SINGLE CARRIAGE"
 },
 {
  "name": "Counterphase",
  "zone": "G / TWO CARRIAGES",
  "hint": "Both carriages keep moving when absent. Watch their ghost tracks and transfer when their paths draw close.",
  "spawn": [
   65,
   492
  ],
  "exit": {
   "x": 1040,
   "y": 392,
   "w": 34,
   "h": 58
  },
  "solids": [
   {
    "x": 0,
    "y": 520,
    "w": 170,
    "h": 80,
    "mask": 3
   },
   {
    "x": 250,
    "y": 460,
    "w": 125,
    "h": 18,
    "mask": 2,
    "move": {
     "x": 40,
     "y": 0,
     "speed": 0.85,
     "phase": 0
    }
   },
   {
    "x": 445,
    "y": 410,
    "w": 125,
    "h": 18,
    "mask": 1,
    "move": {
     "x": 35,
     "y": 0,
     "speed": 1.1,
     "phase": 2.2
    }
   },
   {
    "x": 650,
    "y": 355,
    "w": 125,
    "h": 18,
    "mask": 2,
    "move": {
     "x": 0,
     "y": 30,
     "speed": 0.8,
     "phase": 0.6
    }
   },
   {
    "x": 845,
    "y": 410,
    "w": 125,
    "h": 18,
    "mask": 1,
    "move": {
     "x": 30,
     "y": 0,
     "speed": 1.2,
     "phase": 3
    }
   },
   {
    "x": 1010,
    "y": 450,
    "w": 110,
    "h": 150,
    "mask": 3
   }
  ],
  "hazards": [],
  "shift": true,
  "id": "aer-17",
  "section": 4,
  "note": "AER / G / TWO CARRIAGES"
 },
 {
  "name": "Remember the foothold",
  "zone": "H / FALLING MEMORY",
  "hint": "Striped blue ledges give way. Know where amber will catch you before you leave. The route turns left at the top.",
  "spawn": [
   65,
   642
  ],
  "exit": {
   "x": 250,
   "y": 127,
   "w": 34,
   "h": 58
  },
  "solids": [
   {
    "x": 0,
    "y": 670,
    "w": 170,
    "h": 90,
    "mask": 3
   },
   {
    "x": 235,
    "y": 615,
    "w": 115,
    "h": 18,
    "mask": 1,
    "crumble": true,
    "delay": 0.6
   },
   {
    "x": 420,
    "y": 555,
    "w": 115,
    "h": 18,
    "mask": 2
   },
   {
    "x": 605,
    "y": 495,
    "w": 115,
    "h": 18,
    "mask": 1,
    "crumble": true,
    "delay": 0.55
   },
   {
    "x": 790,
    "y": 435,
    "w": 115,
    "h": 18,
    "mask": 2,
    "crumble": true,
    "delay": 0.65
   },
   {
    "x": 960,
    "y": 375,
    "w": 115,
    "h": 18,
    "mask": 1
   },
   {
    "x": 785,
    "y": 310,
    "w": 115,
    "h": 18,
    "mask": 2
   },
   {
    "x": 600,
    "y": 250,
    "w": 115,
    "h": 18,
    "mask": 1,
    "crumble": true,
    "delay": 0.55
   },
   {
    "x": 415,
    "y": 190,
    "w": 115,
    "h": 18,
    "mask": 2
   },
   {
    "x": 210,
    "y": 185,
    "w": 135,
    "h": 18,
    "mask": 3
   }
  ],
  "hazards": [],
  "shift": true,
  "height": 760,
  "id": "aer-18",
  "section": 4,
  "note": "AER / H / FALLING MEMORY"
 },
 {
  "name": "The safe side of time",
  "zone": "I / SPIKE CORRIDOR",
  "hint": "Every landing is safe in only one era. Outlined teeth warn of the other era. Change time before your feet arrive.",
  "spawn": [
   65,
   492
  ],
  "exit": {
   "x": 1050,
   "y": 402,
   "w": 34,
   "h": 58
  },
  "solids": [
   {
    "x": 0,
    "y": 520,
    "w": 165,
    "h": 80,
    "mask": 3
   },
   {
    "x": 235,
    "y": 480,
    "w": 125,
    "h": 18,
    "mask": 3
   },
   {
    "x": 430,
    "y": 420,
    "w": 125,
    "h": 18,
    "mask": 3
   },
   {
    "x": 625,
    "y": 475,
    "w": 125,
    "h": 18,
    "mask": 3
   },
   {
    "x": 820,
    "y": 420,
    "w": 125,
    "h": 18,
    "mask": 3
   },
   {
    "x": 1010,
    "y": 460,
    "w": 110,
    "h": 140,
    "mask": 3
   }
  ],
  "hazards": [
   {
    "x": 235,
    "y": 466,
    "w": 125,
    "h": 14,
    "mask": 1
   },
   {
    "x": 430,
    "y": 406,
    "w": 125,
    "h": 14,
    "mask": 2
   },
   {
    "x": 625,
    "y": 461,
    "w": 125,
    "h": 14,
    "mask": 1
   },
   {
    "x": 820,
    "y": 406,
    "w": 125,
    "h": 14,
    "mask": 2
   }
  ],
  "shift": true,
  "id": "aer-19",
  "section": 5,
  "note": "AER / I / SPIKE CORRIDOR"
 },
 {
  "name": "The rising sequence",
  "zone": "J / SPEED CLIMB",
  "hint": "Climb the alternating walls. Catch each striped shelf and leave while it holds. The route bends left, then right again.",
  "spawn": [
   75,
   1222
  ],
  "exit": {
   "x": 780,
   "y": 87,
   "w": 34,
   "h": 58
  },
  "solids": [
   {
    "x": 0,
    "y": 1250,
    "w": 210,
    "h": 50,
    "mask": 3
   },
   {
    "x": 270,
    "y": 1180,
    "w": 125,
    "h": 18,
    "mask": 2
   },
   {
    "x": 445,
    "y": 1020,
    "w": 28,
    "h": 280,
    "mask": 2
   },
   {
    "x": 325,
    "y": 1030,
    "w": 105,
    "h": 18,
    "mask": 1,
    "crumble": true,
    "delay": 0.65
   },
   {
    "x": 500,
    "y": 970,
    "w": 135,
    "h": 18,
    "mask": 1
   },
   {
    "x": 705,
    "y": 900,
    "w": 125,
    "h": 18,
    "mask": 2,
    "move": {
     "x": 20,
     "y": 0,
     "speed": 0.9,
     "phase": 0
    }
   },
   {
    "x": 880,
    "y": 705,
    "w": 28,
    "h": 260,
    "mask": 1
   },
   {
    "x": 750,
    "y": 745,
    "w": 115,
    "h": 18,
    "mask": 2,
    "crumble": true,
    "delay": 0.65
   },
   {
    "x": 575,
    "y": 680,
    "w": 125,
    "h": 18,
    "mask": 2
   },
   {
    "x": 445,
    "y": 485,
    "w": 28,
    "h": 265,
    "mask": 1
   },
   {
    "x": 550,
    "y": 495,
    "w": 120,
    "h": 18,
    "mask": 2
   },
   {
    "x": 730,
    "y": 425,
    "w": 125,
    "h": 18,
    "mask": 1
   },
   {
    "x": 910,
    "y": 360,
    "w": 125,
    "h": 18,
    "mask": 2
   },
   {
    "x": 1060,
    "y": 185,
    "w": 28,
    "h": 240,
    "mask": 1
   },
   {
    "x": 920,
    "y": 210,
    "w": 120,
    "h": 18,
    "mask": 2,
    "crumble": true,
    "delay": 0.65
   },
   {
    "x": 735,
    "y": 145,
    "w": 145,
    "h": 18,
    "mask": 3
   }
  ],
  "hazards": [],
  "shift": true,
  "height": 1300,
  "id": "aer-20",
  "section": 5,
  "note": "AER / J / SPEED CLIMB"
 },
 {
  "name": "Read the fork",
  "zone": "K / FALSE ROUTE",
  "hint": "The lower blue corridor is sealed ahead, but you can return. Take amber at the first fork to pass above the seal.",
  "spawn": [
   65,
   472
  ],
  "exit": {
   "x": 1040,
   "y": 342,
   "w": 34,
   "h": 58
  },
  "solids": [
   {
    "x": 0,
    "y": 500,
    "w": 200,
    "h": 100,
    "mask": 3
   },
   {
    "x": 260,
    "y": 470,
    "w": 140,
    "h": 18,
    "mask": 1
   },
   {
    "x": 465,
    "y": 470,
    "w": 185,
    "h": 18,
    "mask": 1
   },
   {
    "x": 430,
    "y": 385,
    "w": 265,
    "h": 20,
    "mask": 3
   },
   {
    "x": 650,
    "y": 385,
    "w": 45,
    "h": 215,
    "mask": 3
   },
   {
    "x": 260,
    "y": 415,
    "w": 135,
    "h": 18,
    "mask": 2
   },
   {
    "x": 450,
    "y": 345,
    "w": 125,
    "h": 18,
    "mask": 1
   },
   {
    "x": 635,
    "y": 280,
    "w": 130,
    "h": 18,
    "mask": 2
   },
   {
    "x": 825,
    "y": 340,
    "w": 130,
    "h": 18,
    "mask": 1
   },
   {
    "x": 1000,
    "y": 400,
    "w": 120,
    "h": 200,
    "mask": 3
   }
  ],
  "hazards": [],
  "shift": true,
  "signs": [
   {
    "x": 480,
    "y": 435,
    "text": "SEALED → / RETURN TO FORK",
    "mask": 1
   }
  ],
  "id": "aer-21",
  "section": 5,
  "note": "AER / K / FALSE ROUTE"
 },
 {
  "name": "One continuous moment",
  "zone": "L / FINAL CHALLENGE",
  "hint": "Climb the changing walls and carriages. At the upper blue shelf, drop into the marked shaft and return to amber before landing.",
  "spawn": [
   65,
   1422
  ],
  "exit": {
   "x": 440,
   "y": 507,
   "w": 34,
   "h": 58
  },
  "solids": [
   {
    "x": 0,
    "y": 1450,
    "w": 175,
    "h": 50,
    "mask": 3
   },
   {
    "x": 235,
    "y": 1380,
    "w": 125,
    "h": 18,
    "mask": 2
   },
   {
    "x": 420,
    "y": 1230,
    "w": 28,
    "h": 270,
    "mask": 2
   },
   {
    "x": 310,
    "y": 1240,
    "w": 105,
    "h": 18,
    "mask": 1,
    "crumble": true,
    "delay": 0.7
   },
   {
    "x": 485,
    "y": 1180,
    "w": 135,
    "h": 18,
    "mask": 1
   },
   {
    "x": 690,
    "y": 1115,
    "w": 135,
    "h": 18,
    "mask": 2,
    "move": {
     "x": 25,
     "y": -15,
     "speed": 0.9,
     "phase": 0
    }
   },
   {
    "x": 865,
    "y": 930,
    "w": 28,
    "h": 280,
    "mask": 1
   },
   {
    "x": 750,
    "y": 955,
    "w": 115,
    "h": 18,
    "mask": 2,
    "crumble": true,
    "delay": 0.7
   },
   {
    "x": 575,
    "y": 885,
    "w": 125,
    "h": 18,
    "mask": 2
   },
   {
    "x": 445,
    "y": 700,
    "w": 28,
    "h": 260,
    "mask": 1
   },
   {
    "x": 550,
    "y": 720,
    "w": 120,
    "h": 18,
    "mask": 2
   },
   {
    "x": 745,
    "y": 650,
    "w": 130,
    "h": 18,
    "mask": 1
   },
   {
    "x": 945,
    "y": 590,
    "w": 120,
    "h": 18,
    "mask": 2
   },
   {
    "x": 1080,
    "y": 415,
    "w": 28,
    "h": 230,
    "mask": 1
   },
   {
    "x": 960,
    "y": 435,
    "w": 110,
    "h": 18,
    "mask": 2
   },
   {
    "x": 785,
    "y": 360,
    "w": 125,
    "h": 18,
    "mask": 1
   },
   {
    "x": 600,
    "y": 300,
    "w": 125,
    "h": 18,
    "mask": 2,
    "move": {
     "x": 25,
     "y": 15,
     "speed": 0.8,
     "phase": 0
    }
   },
   {
    "x": 410,
    "y": 235,
    "w": 125,
    "h": 18,
    "mask": 1,
    "crumble": true,
    "delay": 0.85
   },
   {
    "x": 330,
    "y": 260,
    "w": 20,
    "h": 305,
    "mask": 3
   },
   {
    "x": 545,
    "y": 260,
    "w": 20,
    "h": 305,
    "mask": 3
   },
   {
    "x": 350,
    "y": 565,
    "w": 195,
    "h": 18,
    "mask": 2
   }
  ],
  "hazards": [
   {
    "x": 670,
    "y": 1260,
    "w": 36,
    "h": 36,
    "mask": 1,
    "kind": "saw",
    "move": {
     "x": 30,
     "y": 0,
     "speed": 1.1
    }
   },
   {
    "x": 350,
    "y": 551,
    "w": 42,
    "h": 14,
    "mask": 2
   },
   {
    "x": 495,
    "y": 551,
    "w": 48,
    "h": 14,
    "mask": 2
   }
  ],
  "shift": true,
  "height": 1500,
  "signs": [
   {
    "x": 424,
    "y": 205,
    "text": "FINAL DROP ↓",
    "mask": 3
   },
   {
    "x": 402,
    "y": 530,
    "text": "AMBER CATCH",
    "mask": 1
   }
  ],
  "id": "aer-22",
  "section": 5,
  "note": "AER / L / FINAL CHALLENGE"
 }
];
const SECTIONS=["FIRST CONTACT","WALLS & MOMENTUM","CHANGING ROUTES","AIRBORNE CHAINS","MOVING MEMORIES","MASTERY"];
if(typeof module!=='undefined')module.exports=ROOMS;else{root.Afterspan.ROOMS=ROOMS;root.Afterspan.SECTIONS=SECTIONS;}
})(typeof window!=='undefined'?window:globalThis);
