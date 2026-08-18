export interface County {
  code: string;
  name: string;
  capital: string;
  constituencies: string[];
}

export const KENYAN_COUNTIES: County[] = [
  {
    code: '001',
    name: 'Mombasa',
    capital: 'Mombasa City',
    constituencies: ['Changamwe', 'Jomvu', 'Kisauni', 'Nyali', 'Likoni', 'Mvita'],
  },
  {
    code: '002',
    name: 'Kwale',
    capital: 'Kwale',
    constituencies: ['Msambweni', 'Lunga Lunga', 'Matuga', 'Kinango'],
  },
  {
    code: '003',
    name: 'Kilifi',
    capital: 'Kilifi',
    constituencies: ['Kilifi North', 'Kilifi South', 'Kaloleni', 'Rabai', 'Ganze', 'Malindi', 'Magarini'],
  },
  {
    code: '004',
    name: 'Tana River',
    capital: 'Hola',
    constituencies: ['Garsen', 'Galole', 'Bura'],
  },
  {
    code: '005',
    name: 'Lamu',
    capital: 'Lamu',
    constituencies: ['Lamu East', 'Lamu West'],
  },
  {
    code: '006',
    name: 'Taita-Taveta',
    capital: 'Voi',
    constituencies: ['Taveta', 'Wundanyi', 'Mwatate', 'Voi'],
  },
  {
    code: '007',
    name: 'Garissa',
    capital: 'Garissa',
    constituencies: ['Garissa Township', 'Balambala', 'Lagdera', 'Dadaab', 'Fafi', 'Ijara'],
  },
  {
    code: '008',
    name: 'Wajir',
    capital: 'Wajir',
    constituencies: ['Wajir North', 'Wajir East', 'Tarbaj', 'Wajir West', 'Eldas', 'Wajir South'],
  },
  {
    code: '009',
    name: 'Mandera',
    capital: 'Mandera',
    constituencies: ['Mandera West', 'Banissa', 'Mandera North', 'Mandera South', 'Mandera East', 'Lafey'],
  },
  {
    code: '010',
    name: 'Marsabit',
    capital: 'Marsabit',
    constituencies: ['Moyale', 'North Horr', 'Saku', 'Laisamis'],
  },
  {
    code: '011',
    name: 'Isiolo',
    capital: 'Isiolo',
    constituencies: ['Isiolo North', 'Isiolo South'],
  },
  {
    code: '012',
    name: 'Meru',
    capital: 'Meru',
    constituencies: ['Igembe South', 'Igembe Central', 'Igembe North', 'Tigania West', 'Tigania East', 'North Imenti', 'Buuri', 'Central Imenti', 'South Imenti'],
  },
  {
    code: '013',
    name: 'Tharaka-Nithi',
    capital: 'Chuka',
    constituencies: ['Maara', "Chuka/Igambang'ombe", 'Tharaka'],
  },
  {
    code: '014',
    name: 'Embu',
    capital: 'Embu',
    constituencies: ['Manyatta', 'Runyenjes', 'Mbeere North', 'Mbeere South'],
  },
  {
    code: '015',
    name: 'Kitui',
    capital: 'Kitui',
    constituencies: ['Mwingi North', 'Mwingi West', 'Mwingi Central', 'Kitui West', 'Kitui Rural', 'Kitui Central', 'Kitui East', 'Kitui South'],
  },
  {
    code: '016',
    name: 'Machakos',
    capital: 'Machakos',
    constituencies: ['Masinga', 'Yatta', 'Kangundo', 'Matungulu', 'Kathiani', 'Mavoko', 'Machakos Town', 'Mwala'],
  },
  {
    code: '017',
    name: 'Makueni',
    capital: 'Wote',
    constituencies: ['Mbooni', 'Kilome', 'Kaiti', 'Makueni', 'Kibwezi West', 'Kibwezi East'],
  },
  {
    code: '018',
    name: 'Nyandarua',
    capital: 'Ol Kalou',
    constituencies: ['Kinangop', 'Kipipiri', 'Ol Kalou', 'Ol Jorok', 'Ndaragwa'],
  },
  {
    code: '019',
    name: 'Nyeri',
    capital: 'Nyeri',
    constituencies: ['Tetu', 'Kieni', 'Mathira', 'Othaya', 'Mukurweini', 'Nyeri Town'],
  },
  {
    code: '020',
    name: 'Kirinyaga',
    capital: 'Kerugoya',
    constituencies: ['Mwea', 'Gichugu', 'Ndia', 'Kirinyaga Central'],
  },
  {
    code: '021',
    name: "Murang'a",
    capital: "Murang'a",
    constituencies: ['Kangema', 'Mathioya', 'Kiharu', 'Kigumo', 'Maragwa', 'Kandara', 'Gatanga'],
  },
  {
    code: '022',
    name: 'Kiambu',
    capital: 'Kiambu',
    constituencies: ['Gatundu South', 'Gatundu North', 'Juja', 'Thika Town', 'Ruiru', 'Githunguri', 'Kiambu', 'Kiambaa', 'Kabete', 'Kikuyu', 'Limuru', 'Lari'],
  },
  {
    code: '023',
    name: 'Turkana',
    capital: 'Lodwar',
    constituencies: ['Turkana North', 'Turkana West', 'Turkana Central', 'Loima', 'Turkana South', 'Turkana East'],
  },
  {
    code: '024',
    name: 'West Pokot',
    capital: 'Kapenguria',
    constituencies: ['Kapenguria', 'Sigor', 'Kacheliba', 'Pokot South'],
  },
  {
    code: '025',
    name: 'Samburu',
    capital: 'Maralal',
    constituencies: ['Samburu West', 'Samburu North', 'Samburu East'],
  },
  {
    code: '026',
    name: 'Trans Nzoia',
    capital: 'Kitale',
    constituencies: ['Kwanza', 'Endebess', 'Saboti', 'Kiminini', 'Cherangany'],
  },
  {
    code: '027',
    name: 'Uasin Gishu',
    capital: 'Eldoret',
    constituencies: ['Soy', 'Turbo', 'Moiben', 'Ainabkoi', 'Kapseret', 'Kesses'],
  },
  {
    code: '028',
    name: 'Elgeyo-Marakwet',
    capital: 'Iten',
    constituencies: ['Marakwet East', 'Marakwet West', 'Keiyo North', 'Keiyo South'],
  },
  {
    code: '029',
    name: 'Nandi',
    capital: 'Kapsabet',
    constituencies: ['Tinderet', 'Aldai', 'Nandi Hills', 'Chesumei', 'Emgwen', 'Mosop'],
  },
  {
    code: '030',
    name: 'Baringo',
    capital: 'Kabarnet',
    constituencies: ['Tiaty', 'Baringo North', 'Baringo Central', 'Baringo South', 'Mogotio', 'Eldama Ravine'],
  },
  {
    code: '031',
    name: 'Laikipia',
    capital: 'Nanyuki',
    constituencies: ['Laikipia West', 'Laikipia East', 'Laikipia North'],
  },
  {
    code: '032',
    name: 'Nakuru',
    capital: 'Nakuru',
    constituencies: ['Molo', 'Njoro', 'Naivasha', 'Gilgil', 'Kuresoi South', 'Kuresoi North', 'Subukia', 'Rongai', 'Bahati', 'Nakuru Town West', 'Nakuru Town East'],
  },
  {
    code: '033',
    name: 'Narok',
    capital: 'Narok',
    constituencies: ['Kilgoris', 'Emurua Dikirr', 'Narok North', 'Narok East', 'Narok South', 'Narok West'],
  },
  {
    code: '034',
    name: 'Kajiado',
    capital: 'Kajiado',
    constituencies: ['Kajiado North', 'Kajiado Central', 'Kajiado East', 'Kajiado West', 'Kajiado South'],
  },
  {
    code: '035',
    name: 'Kericho',
    capital: 'Kericho',
    constituencies: ['Kipkelion East', 'Kipkelion West', 'Ainamoi', 'Bureti', 'Belgut', 'Sigowet/Soin'],
  },
  {
    code: '036',
    name: 'Bomet',
    capital: 'Bomet',
    constituencies: ['Sotik', 'Chepalungu', 'Bomet East', 'Bomet Central', 'Konoin'],
  },
  {
    code: '037',
    name: 'Kakamega',
    capital: 'Kakamega',
    constituencies: ['Lugari', 'Likuyani', 'Malava', 'Lurambi', 'Navakholo', 'Mumias West', 'Mumias East', 'Matungu', 'Butere', 'Khwisero', 'Shinyalu', 'Ikolomani'],
  },
  {
    code: '038',
    name: 'Vihiga',
    capital: 'Vihiga',
    constituencies: ['Vihiga', 'Sabatia', 'Hamisi', 'Emuhaya', 'Luanda'],
  },
  {
    code: '039',
    name: 'Bungoma',
    capital: 'Bungoma',
    constituencies: ['Mount Elgon', 'Sirisia', 'Kabuchai', 'Bumula', 'Kanduyi', 'Webuye East', 'Webuye West', 'Kimilili', 'Tongaren'],
  },
  {
    code: '040',
    name: 'Busia',
    capital: 'Busia',
    constituencies: ['Teso North', 'Teso South', 'Nambale', 'Matayos', 'Butula', 'Funyula', 'Budalangi'],
  },
  {
    code: '041',
    name: 'Siaya',
    capital: 'Siaya',
    constituencies: ['Ugenya', 'Ugunja', 'Alego Usonga', 'Gem', 'Bondo', 'Rarieda'],
  },
  {
    code: '042',
    name: 'Kisumu',
    capital: 'Kisumu',
    constituencies: ['Kisumu East', 'Kisumu West', 'Kisumu Central', 'Seme', 'Nyando', 'Muhoroni', 'Nyakach'],
  },
  {
    code: '043',
    name: 'Homa Bay',
    capital: 'Homa Bay',
    constituencies: ['Kasipul', 'Kabondo Kasipul', 'Karachuonyo', 'Rangwe', 'Homa Bay Town', 'Ndhiwa', 'Suba North', 'Suba South'],
  },
  {
    code: '044',
    name: 'Migori',
    capital: 'Migori',
    constituencies: ['Rongo', 'Awendo', 'Suna East', 'Suna West', 'Uriri', 'Nyatike', 'Kuria West', 'Kuria East'],
  },
  {
    code: '045',
    name: 'Kisii',
    capital: 'Kisii',
    constituencies: ['Bonchari', 'South Mugirango', 'Bomachoge Borabu', 'Bobasi', 'Bomachoge Chache', 'Nyaribari Masaba', 'Nyaribari Chache', 'Kitutu Chache North', 'Kitutu Chache South'],
  },
  {
    code: '046',
    name: 'Nyamira',
    capital: 'Nyamira',
    constituencies: ['Kitutu Masaba', 'West Mugirango', 'North Mugirango', 'Borabu'],
  },
  {
    code: '047',
    name: 'Nairobi',
    capital: 'Nairobi',
    constituencies: ['Westlands', 'Dagoretti North', 'Dagoretti South', "Lang'ata", 'Kibra', 'Roysambu', 'Kasarani', 'Ruaraka', 'Embakasi South', 'Embakasi North', 'Embakasi Central', 'Embakasi East', 'Embakasi West', 'Makadara', 'Kamukunji', 'Starehe', 'Mathare'],
  },
];

// Helper functions
export const getCountyByName = (name: string): County | undefined => {
  return KENYAN_COUNTIES.find((c) => c.name.toLowerCase() === name.toLowerCase());
};

export const getCountyByCode = (code: string): County | undefined => {
  return KENYAN_COUNTIES.find((c) => c.code === code);
};

export const getCountyOptions = () => {
  return KENYAN_COUNTIES.map((c) => ({
    value: c.name,
    label: c.name,
  }));
};

export const getConstituencyOptions = (countyName?: string) => {
  const county = countyName ? getCountyByName(countyName) : undefined;
  const constituencies = county
    ? county.constituencies
    : KENYAN_COUNTIES.flatMap((c) => c.constituencies);

  return constituencies.map((c) => ({
    value: c,
    label: c,
  }));
};