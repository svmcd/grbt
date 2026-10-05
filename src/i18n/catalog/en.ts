import type { CatalogTranslations } from "./types";

const donation = (city: string) =>
    `5% of the profit from this T-shirt will be donated to an animal care organization in ${city}. We will find a local organization, but if you know a good one, please let us know: info@egrikuyu.com`;

const donationGeneric =
    "5% of the profit from this T-shirt will be donated to an animal care organization. We will find a local organization, but if you know a good one, please let us know: info@egrikuyu.com";

const cityFeatures = (city: string) => `The historical and cultural features of ${city}`;
const blackSeaBeauty = (city: string) => `A design reflecting the unique beauty of the Black Sea in ${city}.`;
const coldButWarm = (city: string) => `A design reflecting the cold yet warm-hearted atmosphere of ${city}.`;
const richHeritage = (city: string) => `A design reflecting the rich history and cultural heritage of ${city}.`;

const products: CatalogTranslations = {
    afyon: {
        description: "A design that captures the spirit of Afyon, a city famous for its historic fabric and thermal springs. Where traditional architecture meets natural beauty.",
        donationText: donation("Afyon"),
        designOrigin: "Afyon Castle and the thermal springs",
        cityInfo: {
            general: "Afyon is one of the major cities of the Aegean Region. Famous for its thermal springs, the city is known for the historic Afyon Castle and its traditional architecture. It is one of Turkey's largest centers of thermal tourism.",
            culture: "The people of Afyon are known for their hospitality and their devotion to traditional values. The city's cultural fabric has been shaped by a blend of thermal tourism and agriculture. It is also famous for local delicacies such as Afyon lokum and kaymak.",
        },
    },
    aksaray: {
        description: "A design carrying the rich history and cultural heritage of Aksaray. The captivating atmosphere of this city, the gateway to Cappadocia.",
        donationText: donation("Aksaray"),
        designOrigin: "Aksaray Grand Mosque and the historic bazaar",
        cityInfo: {
            general: "Aksaray is a historic city in the Central Anatolia Region. Known as the gateway to Cappadocia, the city is famous for its fairy chimneys and underground cities. It is home to important monuments from the Seljuk and Ottoman periods.",
            culture: "The people of Aksaray are mindful of preserving their historical heritage. The city's cultural life has been shaped by tourism and agriculture. Traditional handicrafts and the local culinary culture are still very much alive.",
        },
    },
    ardahan: {
        description: "A design reflecting the cold yet warm-hearted atmosphere of Ardahan. The unique nature and cultural richness of Eastern Anatolia.",
        donationText: donation("Ardahan"),
        designOrigin: "Ardahan Castle and the Posof border crossing",
        cityInfo: {
            general: "Ardahan is a city in the Eastern Anatolia Region, on the border with Georgia. It is known for its cold climate and natural beauty. With the historic Ardahan Castle and the natural areas around it, the city enchants its visitors.",
            culture: "The people of Ardahan are known for their culture of solidarity and mutual support. As a border city, it has a multicultural character. Traditional music and dance, local cuisine and handicrafts are still kept alive.",
        },
    },
    gaziantep: {
        description: "A design carrying Gaziantep's rich culinary culture and historic fabric. The city of pistachios and copperwork.",
        donationText: donation("Gaziantep"),
        designOrigin: "Gaziantep Castle and the Zeugma mosaics",
        cityInfo: {
            general: "Gaziantep is one of the largest cities in Southeastern Anatolia. Holding the title of UNESCO City of Gastronomy, the city is known for its rich culinary culture and historic fabric. It is famous for its pistachios, baklava and many kinds of kebab.",
            culture: "The people of Gaziantep are known for their entrepreneurial spirit in trade and industry. The city's cultural life has been shaped by a blend of traditional handicrafts and modern industry. It captivates visitors with its hospitality and local flavors.",
        },
    },
    karaman: {
        description: "A design reflecting the atmosphere of Karaman, a center of traditional Turkish culture. The city of Yunus Emre.",
        donationText: donation("Karaman"),
        designOrigin: "Karaman Castle and the Tomb of Yunus Emre",
        cityInfo: {
            general: "Karaman, in the Central Anatolia Region, is one of the important centers of Turkish culture. Known as the city of Yunus Emre, Karaman is recognized for its Sufi culture and traditional Turkish values. The city enchants visitors with its historic fabric and cultural heritage.",
            culture: "The people of Karaman are known for their devotion to traditional Turkish culture and their respect for religious values. The city's cultural life has been shaped by a blend of the Sufi tradition and modern life. Yunus Emre's philosophy still lives on in the city's social fabric.",
        },
    },
    kayseri: {
        description: "A design reflecting the dynamic atmosphere of Kayseri, a center of trade. Mount Erciyes and a traditional culture of trade.",
        donationText: donation("Kayseri"),
        designOrigin: "Mount Erciyes and Kayseri Castle",
        cityInfo: {
            general: "Kayseri is one of the important centers of trade and industry in Central Anatolia. Founded at the foot of Mount Erciyes, the city is known for the historic Kayseri Castle and its traditional culture of trade. It has a dynamic character in which modern industry and traditional values come together.",
            culture: "The people of Kayseri are known for their success in trade and entrepreneurship. The city's cultural life has been shaped by traditional business ethics and the influence of the modern business world. The natural beauty of Mount Erciyes is also reflected in the city's social life.",
        },
    },
    konya: {
        description: "A design carrying the deep culture of Konya, a spiritual center. The city of Mevlana and the Sufi tradition.",
        donationText: donation("Konya"),
        designOrigin: "The Mevlana Mausoleum and Konya Castle",
        cityInfo: {
            general: "Konya is a historic city known as the spiritual center of Central Anatolia. Recognized as the city of Mevlana, Konya is famous for its Sufi culture and spiritual values. The city enchants visitors with its Seljuk architecture and historic fabric.",
            culture: "The people of Konya are known for their devotion to spiritual values and their respect for the Sufi tradition. The city's cultural life has been shaped by the harmonious union of Mevlana's philosophy and modern life. Traditional music and art are still kept alive.",
        },
    },
    nevsehir: {
        description: "A design reflecting Nevşehir's fairy chimneys and the magical atmosphere of Cappadocia. Natural wonders and historic sites.",
        donationText: donation("Nevşehir"),
        designOrigin: "The fairy chimneys and the Cappadocia landscape",
        cityInfo: {
            general: "Nevşehir is a magical city in the heart of the Cappadocia region. Famous for its fairy chimneys and underground cities, the city enchants visitors with natural wonders and historic sites. It is the center of Cappadocia, which is on the UNESCO World Heritage List.",
            culture: "The people of Nevşehir are known for their experience in tourism and their awareness of the need to preserve their natural heritage. The city's cultural life has been shaped by a blend of traditional handicrafts and modern tourism services. The magic of the fairy chimneys is also reflected in the city's social life.",
        },
    },
    sivas: {
        description: "A design carrying the rich history of Sivas, the cultural capital of Anatolia. Seljuk architecture and traditional handicrafts.",
        donationText: donation("Sivas"),
        designOrigin: "Sivas Castle and the Çifte Minareli Medrese",
        cityInfo: {
            general: "Sivas is a historic city known as the cultural capital of Central Anatolia. Home to some of the finest examples of Seljuk architecture, the city is known for the Çifte Minareli Medrese and its historic castle. It is famous for its traditional handicrafts and cultural heritage.",
            culture: "The people of Sivas are known for their devotion to cultural values and their interest in traditional handicrafts. The city's cultural life has been shaped by the harmonious union of its Seljuk heritage and modern life. Traditional music and folklore are still kept alive.",
        },
    },
    trabzon: {
        description: "A design reflecting the green nature of Trabzon, the pearl of the Black Sea. Uzungöl and traditional Black Sea culture.",
        donationText: donation("Trabzon"),
        designOrigin: "Uzungöl and Trabzon Castle",
        cityInfo: {
            general: "Trabzon, known as the pearl of the Black Sea, is famous for its green nature. Known for Uzungöl and the historic Trabzon Castle, the city enchants visitors with its natural beauty and traditional Black Sea culture. It offers a magnificent combination of sea and mountain views.",
            culture: "The people of Trabzon carry the characteristic traits of the Black Sea region. The city's cultural life has been shaped by the traditional horon dances and local music. It is known for its hospitality and its harmony with nature.",
        },
    },
    yozgat: {
        description: "A design reflecting Yozgat's historic fabric and traditional architecture. The cultural richness of Central Anatolia.",
        donationText: donation("Yozgat"),
        designOrigin: "Yozgat Castle and traditional architecture",
        cityInfo: {
            general: "Yozgat is one of the important cities of the Central Anatolia Region. Known for its historic fabric and traditional architecture, the city holds an important place in agriculture and livestock farming. It impresses visitors with its cultural heritage and natural beauty.",
            culture: "The people of Yozgat are known for their devotion to traditional values and their hospitality. The city's cultural life has been shaped by local festivals and traditional handicrafts. Agriculture and livestock farming form the city's social fabric.",
        },
    },
    ankara: {
        description: "A design that unites Ankara's identity as a modern capital with its historic fabric. Atatürk's city and the heart of Turkey.",
        donationText: donation("Ankara"),
        designOrigin: "Anıtkabir and Ankara Castle",
        cityInfo: {
            general: "Ankara is the capital of Turkey and its second largest city. Blending its modern character with its historic fabric, the city is not only the political center but also the heart of cultural and social life. It is known for Anıtkabir, Ankara Castle and its modern architecture.",
            culture: "The people of Ankara form a dynamic community of people from many different cultures. The city is a place where a modern lifestyle meets traditional values. It plays an important role in education, art and culture.",
        },
    },
    aydin: {
        description: "A design reflecting the fertile Aegean land and ancient history of Aydın. The land of olives and figs.",
        donationText: donation("Aydın"),
        designOrigin: "The ancient city of Ephesus and Aegean nature",
        cityInfo: {
            general: "Aydın is a historic city on the fertile land of the Aegean Region. Known for the ancient city of Ephesus and its rich farmland, the city holds an important place in tourism and agriculture. The warm Aegean climate and natural beauty make the city attractive.",
            culture: "The people of Aydın carry the warm-hearted, hospitable character of the Aegean. The city's cultural life has been shaped by a blend of its ancient heritage and a modern lifestyle. The culture of olives, figs and grapes forms the city's social fabric.",
        },
    },
    gumushane: {
        description: "A design reflecting the mountainous nature and historic silver mines of Gümüşhane. A hidden treasure in the heights of the Black Sea region.",
        donationText: donation("Gümüşhane"),
        designOrigin: "Silver mines and mountainous nature",
        cityInfo: {
            general: "Gümüşhane is a historic city in the mountainous part of the Black Sea Region. Known for its historic silver mines and natural beauty, the city has a unique geography owing to its high altitude. It impresses visitors with its mining history and natural riches.",
            culture: "The people of Gümüşhane are a resilient, hardworking community, used to the hardships of mountain life. The city's cultural life has been shaped by its mining tradition and in harmony with nature. Traditional handicrafts and local music hold an important place.",
        },
    },
    nigde: {
        description: "A design reflecting the unique nature and historic fabric of Cappadocia in Niğde. Fairy chimneys and ancient history.",
        donationText: donation("Niğde"),
        designOrigin: "The fairy chimneys of Cappadocia and Niğde Castle",
        cityInfo: {
            general: "Niğde is one of the important cities of the Cappadocia region. Famous for its fairy chimneys and ancient history, the city holds an important place in tourism and agriculture. Cappadocia's unique natural formations and historic fabric make the city attractive.",
            culture: "The people of Niğde are a community that cherishes Cappadocia's historical heritage and is devoted to cultural values. The city's cultural life has been shaped by a blend of its ancient heritage and a modern lifestyle. Tourism and traditional handicrafts hold an important place.",
        },
    },
    rize: {
        description: "A design reflecting the tea gardens of Rize and the green nature of the Black Sea. The homeland of tea and natural beauty.",
        donationText: donation("Rize"),
        designOrigin: "Tea gardens and Black Sea nature",
        cityInfo: {
            general: "Rize is a city famous for its green nature, known as the tea-growing center of the Black Sea Region. Known for its tea gardens and mountainous geography, the city holds an important place in agriculture and tourism. The humid Black Sea climate and fertile soil make the city attractive.",
            culture: "The people of Rize carry the tea culture and the characteristic traits of the Black Sea region. The city's cultural life has been shaped by its tea-growing tradition and in harmony with nature. Traditional horon dances and local music hold an important place.",
        },
    },
    corum: {
        description: "A design reflecting the historic fabric of Çorum, the heart of the Hittite civilization. Ancient history and traditional culture.",
        donationText: donation("Çorum"),
        designOrigin: "Hattusa and the Hittite civilization",
        cityInfo: {
            general: "Çorum is a historic city that is home to Hattusa, the capital of the Hittite civilization. Known for its ancient history and archaeological riches, the city is an important cultural center on the UNESCO World Heritage List. It enchants visitors with a historic fabric that bears the traces of the Hittite civilization.",
            culture: "The people of Çorum are a community that cherishes its historical heritage and is devoted to cultural values. The city's cultural life has been shaped by a blend of the traces of the Hittite civilization and modern life. Archaeological tourism and traditional handicrafts hold an important place.",
        },
    },
    usak: {
        description: "A design reflecting the calm atmosphere of Uşak in the inland Aegean. Traditional carpet weaving and natural beauty.",
        donationText: donation("Uşak"),
        designOrigin: "Uşak carpets and traditional weaving",
        cityInfo: {
            general: "Uşak is a city in the inland part of the Aegean Region, famous for its traditional carpet weaving. Uşak carpets are handcrafted works known around the world. The city impresses visitors with its natural beauty and traditional culture.",
            culture: "The people of Uşak are known for their interest in traditional handicrafts and their mastery of carpet weaving. The city's cultural life has been shaped by the harmonious union of its traditional weaving culture and modern life. Handicrafts and local music hold an important place.",
        },
    },
    kirsehir: {
        description: "A design reflecting the Sufi culture of Kırşehir, the city of Ahi Evran. The Ahi tradition and spiritual values.",
        donationText: donation("Kırşehir"),
        designOrigin: "Ahi Evran and the Ahi tradition",
        cityInfo: {
            general: "Kırşehir is a historic city known as the city of Ahi Evran and the center of the Ahi tradition. Known for its Sufi culture and spiritual values, the city is one of the important centers of traditional Turkish culture. It impresses visitors with its spiritual atmosphere and cultural heritage.",
            culture: "The people of Kırşehir are known for their devotion to Sufi culture and their respect for spiritual values. The city's cultural life has been shaped by a blend of the Ahi tradition and modern life. Traditional music and folklore are still kept alive.",
        },
    },
    sakarya: {
        description: "A design reflecting the fertile land and natural beauty of the Marmara region in Sakarya. Lake Sapanca and green nature.",
        donationText: donation("Sakarya"),
        designOrigin: "Lake Sapanca and the Sakarya River",
        cityInfo: {
            general: "Sakarya is one of the cities of the Marmara Region famous for their natural beauty. Known for Lake Sapanca and the Sakarya River, the city holds an important place in agriculture and industry. The blend of natural beauty and a modern lifestyle makes the city attractive.",
            culture: "The people of Sakarya are known for their harmony with nature and their embrace of a modern lifestyle. The city's cultural life has been shaped by the harmonious union of natural beauty and urban life. Water sports and nature tourism hold an important place.",
        },
    },
    agri: {
        description: "A design reflecting the majesty of Mount Ağrı (Ararat), the highest mountain in Turkey. The natural beauty of Eastern Anatolia.",
        donationText: donation("Ağrı"),
        designOrigin: "Mount Ağrı (Ararat) and the nature of Eastern Anatolia",
        cityInfo: {
            general: "Ağrı is a city famous for its natural beauty, founded at the foot of Mount Ağrı (Ararat), the highest mountain in Turkey. Bearing the characteristic features of Eastern Anatolia, the city is an important center for mountaineering and outdoor sports. It enchants visitors with its majestic natural scenery.",
            culture: "The people of Ağrı are a resilient, hardworking community, used to the hardships of mountain life. The city's cultural life has been shaped in harmony with nature. Mountaineering and traditional handicrafts hold an important place.",
        },
    },
    // Hasret Collection (organization names are proper names and stay as they are)
    "gurbetten-memlekete": {
        description: "A design reflecting the longing for home of Turks living abroad. The homesickness in the hearts of those who live in faraway lands.",
        donationText: "Gurbetçi Hayvan Dostları",
        designOrigin: "Diaspora culture and ties to the homeland",
    },
    "sıla-yolu": {
        description: "A design carrying the long road home and the longing of Turks abroad to return. A memory with every kilometer.",
        donationText: "Sıla Yolu Hayvan Barınağı",
        designOrigin: "The roads of the diaspora and longing for the homeland",
    },
    yabanci: {
        description: "A design reflecting the struggle for identity and the cultural belonging of Turks living in foreign lands.",
        donationText: "Yabancı Diyarlar Hayvan Koruma",
        designOrigin: "Cultural identity and a sense of belonging",
    },
    // Sinema Collection
    devam: {
        description: "A special design carrying the line “Devam”, inspired by Turkish cinema.",
        donationText: donationGeneric,
        designOrigin: "Turkish cinema",
    },
    recep_to_my_sibel: {
        description: "A romantic design inspired by Turkish cinema.",
        donationText: donationGeneric,
        designOrigin: "Turkish cinema",
    },
    sensiz_olmaz: {
        description: "A special design inspired by Turkish cinema.",
        donationText: donationGeneric,
        designOrigin: "Turkish cinema",
    },
    sibel_to_my_recep: {
        description: "A romantic design inspired by Turkish cinema.",
        donationText: donationGeneric,
        designOrigin: "Turkish cinema",
    },
    // Turkish Time Collection
    "turkish-time-cay": {
        description: "Front print: a steaming tulip-shaped tea glass with a spoon, on a patterned saucer. Below it, the line “You met me at a very Turkish time in my life.”",
        donationText: donationGeneric,
        designOrigin: "The Turkish tea glass",
    },
    "turkish-time-bozkurt": {
        description: "Front print: a running grey wolf (bozkurt). Below it, the line “You met me at a very Turkish time in my life.”",
        donationText: donationGeneric,
        designOrigin: "A running grey wolf",
    },
    // New cities
    denizli: {
        description: richHeritage("Denizli"),
        donationText: donation("Denizli"),
        designOrigin: cityFeatures("Denizli"),
    },
    erzurum: {
        description: coldButWarm("Erzurum"),
        donationText: donation("Erzurum"),
        designOrigin: cityFeatures("Erzurum"),
    },
    giresun: {
        description: blackSeaBeauty("Giresun"),
        donationText: donation("Giresun"),
        designOrigin: cityFeatures("Giresun"),
    },
    kahramanmaras: {
        description: "A design reflecting the rich cultural heritage of Kahramanmaraş.",
        donationText: donation("Kahramanmaraş"),
        designOrigin: cityFeatures("Kahramanmaraş"),
    },
    kars: {
        description: coldButWarm("Kars"),
        donationText: donation("Kars"),
        designOrigin: cityFeatures("Kars"),
    },
    mardin: {
        description: "A design reflecting the unique architecture and cultural richness of Mardin.",
        donationText: donation("Mardin"),
        designOrigin: cityFeatures("Mardin"),
    },
    ordu: {
        description: blackSeaBeauty("Ordu"),
        donationText: donation("Ordu"),
        designOrigin: cityFeatures("Ordu"),
    },
    samsun: {
        description: blackSeaBeauty("Samsun"),
        donationText: donation("Samsun"),
        designOrigin: cityFeatures("Samsun"),
    },
    sanliurfa: {
        description: richHeritage("Şanlıurfa"),
        donationText: donation("Şanlıurfa"),
        designOrigin: cityFeatures("Şanlıurfa"),
    },
    zonguldak: {
        description: blackSeaBeauty("Zonguldak"),
        donationText: donation("Zonguldak"),
        designOrigin: cityFeatures("Zonguldak"),
    },
};

export default products;
