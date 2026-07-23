/* ============================================================
   HLOPHE OUTDOOR MEDIA — Shared site inventory dataset
   Single source of truth for portfolio.html and dashboard.html.
   Prices are intentionally NOT included in this file.
   Sourced from the HOM Sites deck (2026-07-23).
   ============================================================ */
(function (root) {
  'use strict';

  // Identical 102,000,987 value appears on 3 sites in the source deck —
  // an obvious copy-paste error. Flagged, suppressed from display, and
  // excluded from all aggregate totals.
  var SUSPECT = 102000987;

  var SITES = [
    { slug:'orlando-soweto', name:'Orlando, Soweto', code:'HOM-SWTP013',
      area:'Soweto', region:'Soweto', lsm:'LSM 5-8', lsmLow:5, lsmHigh:8,
      format:'Static billboard', formatType:'Static', size:'7m × 25m', areaM2:175,
      traffic:1578765, illum:'No', avail:'Immediately', gps:`26°14'24.2"S 27°54'42.8"E`,
      desc:`At the intersection of Klipspruit Valley Road and Vilakazi Street, one of Soweto's busiest commuter corridors. Adjacent to a taxi rank and near the train station, with continuous footfall and peak-hour activity all day.`,
      photos:['photo.jpg'], map:'map.jpg' },

    { slug:'maboneng-johannesburg', name:'Maboneng, Johannesburg', code:'HOM-MBN011',
      area:'Johannesburg CBD', region:'Johannesburg', lsm:'LSM 5-8', lsmLow:5, lsmHigh:8,
      format:'Static billboard', formatType:'Static', size:'5m × 55m', areaM2:275,
      traffic:1406911, illum:'No', avail:'Immediately', gps:`26°12'11.5"S 28°03'32.0"E`,
      desc:`On busy Commissioner Street in the Maboneng Precinct, one of Johannesburg's most vibrant lifestyle and cultural hubs, with strong urban visibility to heavy vehicle and pedestrian traffic.`,
      photos:['photo.jpg'], map:'map.jpg' },

    { slug:'maboneng-cbd', name:'Maboneng Lifestyle Centre, JHB CBD', code:'HOM-MBN012',
      area:'Johannesburg CBD', region:'Johannesburg', lsm:'LSM 6-8', lsmLow:6, lsmHigh:8,
      format:'Static billboard (double-sided)', formatType:'Double-sided',
      size:'Side A 20m × 16m + Side B 20m × 14m', areaM2:600,
      traffic:1406911, illum:'No', avail:'Immediately', gps:`26°12'12.3"S 28°03'36.3"E`,
      desc:`In the heart of Maboneng on busy Commissioner Street. Two-sided billboard on the Lifestyle Centre building, with outstanding exposure to heavy vehicle and pedestrian traffic daily.`,
      photos:['photo.jpg'], map:'map.jpg' },

    { slug:'africa-cafe-pimville-soweto', name:'Africa Café, Pimville, Soweto', code:'HOM-PIM012',
      area:'Pimville, Soweto', region:'Soweto', lsm:'LSM 5-8', lsmLow:5, lsmHigh:8,
      format:'Static billboard', formatType:'Static', size:'4m × 15m', areaM2:60,
      traffic:906987, illum:'No', avail:'Immediately', gps:`26°15'38.6"S 27°54'53.3"E`,
      desc:`At the main entrance of Africa Café, a busy social hub in Pimville, with high visibility to all patrons, strong foot traffic and extended exposure during peak periods.`,
      photos:['photo.jpg'], map:'map.jpg' },

    { slug:'kyalami-shisanyama-midrand', name:'Kyalami Shisanyama, Midrand', code:'HOM-KYN010',
      area:'Midrand', region:'Midrand', lsm:'LSM 5-8', lsmLow:5, lsmHigh:8,
      format:'Static billboard', formatType:'Static', size:'5m × 20m', areaM2:100,
      traffic:876987, illum:'No', avail:'Immediately', gps:`26°00'10.6"S 28°04'29.2"E`,
      desc:`At the main entrance of Kyalami Shisanyama: every arriving guest sees it. Constant foot and vehicle traffic, slow entry movement and a vibrant social crowd in a premium nightlife environment.`,
      photos:['photo.jpg'], map:'map.jpg' },

    { slug:'centurion-shisanyama', name:'Centurion Shisanyama, Centurion', code:'HOM-CYN011',
      area:'Centurion', region:'Centurion', lsm:'LSM 5-8', lsmLow:5, lsmHigh:8,
      format:'Static billboard (roof-level)', formatType:'Roof-level', size:'2.5m × 20m', areaM2:50,
      traffic:860900, illum:'No', avail:'Immediately', gps:`25°51'32.7"S 28°11'28.5"E`,
      desc:`Roof-level placement inside Centurion Shisanyama, commanding full visibility across the venue. Extended dwell times deliver strong recall and repeated exposure to a lively, high-traffic audience.`,
      photos:['photo.jpg'], map:'map.jpg' },

    { slug:'tembisa-plaza', name:'Tembisa Plaza, Tembisa', code:'HOM-TMB01',
      area:'Tembisa', region:'Tembisa', lsm:'LSM 5-8', lsmLow:5, lsmHigh:8,
      format:'Static billboard', formatType:'Static', size:'8m × 40m', areaM2:320,
      traffic:810005, illum:'No', avail:'Immediately', gps:`26°01'39.0"S 28°11'38.1"E`,
      desc:`Large-format site on Andrew Mapheto Drive, directly between Tembisa Plaza and Birch Acres Mall. High daily volumes of motorists, taxi commuters and pedestrians moving between the two major retail hubs.`,
      photos:['photo.jpg'], map:'map.jpg' },

    { slug:'alex-plaza-alexandra', name:'Alex Plaza & Shopping Centre, Alexandra', code:'HOM-ALX001',
      area:'Alexandra', region:'Alexandra', lsm:'LSM 5-8', lsmLow:5, lsmHigh:8,
      format:'Static billboard', formatType:'Static', size:'5m × 40m', areaM2:200,
      traffic:700880, illum:'No', avail:'Immediately', gps:`26°06'22.4"S 28°05'13.6"E`,
      desc:`Between Alexandra Plaza and Pan Africa Shopping Centre, next to the busy Alexandra taxi rank, with continuous exposure to commuters, shoppers and motorists moving between the two hubs.`,
      photos:['photo.jpg','photo-2.jpg'], map:'map.jpg' },

    { slug:'atlyn-mall-atteridgeville', name:'Atlyn Mall, Atteridgeville', code:'HOM-ATTR001',
      area:'Atteridgeville, Pretoria', region:'Pretoria', lsm:'LSM 5-8', lsmLow:5, lsmHigh:8,
      format:'Static billboard', formatType:'Static', size:'8m × 30m', areaM2:240,
      traffic:670987, illum:'No', avail:'Immediately', gps:`25°46'29.0"S 28°05'23.1"E`,
      desc:`On Maunde Street, the main entrance into Atteridgeville, next to Atlyn Shopping Centre, the area's largest retail hub, and near Tshwane South TVET College. Daily exposure to shoppers, students and commuters.`,
      photos:['photo.jpg'], map:'map.jpg' },

    { slug:'jabulani-mall-soweto', name:'Jabulani Mall, Soweto', code:'HOM-SWT004',
      area:'Soweto', region:'Soweto', lsm:'LSM 5-8', lsmLow:5, lsmHigh:8,
      format:'Static billboard (double-sided)', formatType:'Double-sided', size:'2m × 10m', areaM2:20,
      traffic:661980, illum:'Yes', avail:'Immediately', gps:`26°14'55.5"S 27°51'26.3"E`,
      desc:`Double-sided site at the main entrance of Jabulani Mall, corner of Koma and Bolani Road. Jabulani Mall is a dominant retail centre with over 100 stores at the heart of Soweto.`,
      photos:['photo.jpg'], map:'map.jpg' },

    { slug:'protea-glen-mall-soweto', name:'Protea Glen Mall, Soweto', code:'HOM-SWTP010',
      area:'Soweto', region:'Soweto', lsm:'LSM 5-8', lsmLow:5, lsmHigh:8,
      format:'Static billboard', formatType:'Static', size:'8m × 30m', areaM2:240,
      traffic:500765, illum:'No', avail:'Immediately', gps:`26°16'54.4"S 27°48'52.1"E`,
      desc:`Right next to Protea Glen Mall, facing R558 traffic connecting Krugersdorp with Ennerdale via the N12, the main road feeding Dobsonville, Doornkop, Lufhereng, Kagiso, Jabulani, Zola and Emdeni.`,
      photos:['photo.jpg'], map:'map.jpg' },

    { slug:'china-mall-main-reef-rd', name:'China Mall, Main Reef Rd', code:'HOM-CHN001',
      area:'Johannesburg', region:'Johannesburg', lsm:'LSM 5-8', lsmLow:5, lsmHigh:8,
      format:'Static billboard', formatType:'Static', size:'5m × 30m', areaM2:150,
      traffic:SUSPECT, illum:'No', avail:'Immediately', gps:`26°12'56.0"S 28°00'08.8"E`,
      desc:`On high-traffic Main Reef Road, directly next to China Mall Johannesburg, giving nonstop exposure to commuters, traders and shoppers every day.`,
      photos:['photo.jpg'], map:'map.jpg' },

    { slug:'wierda-valley-sandton', name:'Wierda Valley, Sandton', code:'HOM-SNDT001',
      area:'Sandton', region:'Sandton', lsm:'LSM 5-8', lsmLow:5, lsmHigh:8,
      format:'Static billboard', formatType:'Static', size:'5m × 30m', areaM2:150,
      traffic:SUSPECT, illum:'No', avail:'Immediately', gps:`26°06'40.7"S 28°03'22.4"E`,
      desc:`Corner of Katherine Street and Pybus Road, inside Africa's leading financial district. A constant flow of affluent professionals and high-value consumers, with heavy traffic and extended dwell times.`,
      photos:['photo.jpg'], map:'map.jpg' },

    { slug:'glenanda-jhb-south', name:'Glenanda Shopping Centre, JHB South', code:'HOM-GLD010',
      area:'Johannesburg South', region:'Johannesburg', lsm:'LSM 5-8', lsmLow:5, lsmHigh:8,
      format:'Static billboard (hotel wrap)', formatType:'Hotel wrap', size:'6m × 39m', areaM2:234,
      traffic:SUSPECT, illum:'No', avail:'Immediately', gps:`26°16'16.0"S 28°02'15.1"E`,
      desc:`On Voster Avenue opposite Glenanda Village Shopping Centre, fully wrapping the Glenanda Hotel. The only billboard in the area, giving complete category exclusivity with zero media clutter.`,
      photos:['photo.jpg','photo-2.jpg'], map:'map.jpg' },

    { slug:'national-truck-fleet', name:'National Long-Haul Truck Fleet', code:'HOM-TRCK 1-15',
      area:'National routes', region:'National', lsm:'LSM 3-10', lsmLow:3, lsmHigh:10,
      format:'Full truck wrap (flat-sided) · 15 trucks', formatType:'Truck fleet',
      size:'2.5m × 15m per truck', areaM2:562.5, trucks:15,
      traffic:5906007, illum:'N/A', avail:'Immediately', gps:'',
      travelling:'18 000 km per month, nationally',
      desc:`A bold large-trailer canvas ideal for national brand campaigns. 15 fully wrapped trucks travelling 18 000 km per month, delivering repeated exposure to motorists and roadside audiences across urban and rural South Africa.`,
      photos:['photo.jpg'], map:null }
  ];

  root.HOM_SUSPECT_TRAFFIC = SUSPECT;
  root.HOM_SITES = SITES;
})(window);
