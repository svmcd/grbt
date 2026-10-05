import type { CatalogTranslations } from "./types";

const donation = (city: string) =>
    `5 % des bénéfices de ce T-shirt seront reversés à une organisation qui prend soin des animaux à ${city}. Nous trouverons une organisation locale, mais si vous en connaissez une bonne, faites-le-nous savoir : info@egrikuyu.com`;

const donationGeneric =
    "5 % des bénéfices de ce T-shirt seront reversés à une organisation qui prend soin des animaux. Nous trouverons une organisation locale, mais si vous en connaissez une bonne, faites-le-nous savoir : info@egrikuyu.com";

// "de Denizli" / "d'Erzurum": pass the city with its preposition.
const cityFeatures = (ofCity: string) => `Les particularités historiques et culturelles ${ofCity}`;
const blackSeaBeauty = (city: string) => `Un design qui reflète les beautés uniques de la mer Noire à ${city}.`;
const coldButWarm = (ofCity: string) => `Un design qui reflète l'atmosphère froide mais chaleureuse ${ofCity}.`;
const richHeritage = (ofCity: string) => `Un design qui reflète la riche histoire et le patrimoine culturel ${ofCity}.`;

const products: CatalogTranslations = {
    afyon: {
        description: "Un design qui reflète l'âme d'Afyon, ville célèbre pour son patrimoine historique et ses sources thermales. La rencontre de l'architecture traditionnelle et des beautés naturelles.",
        donationText: donation("Afyon"),
        designOrigin: "La forteresse d'Afyon et les sources thermales",
        cityInfo: {
            general: "Afyon est l'une des villes importantes de la région égéenne. Célèbre pour ses sources thermales, la ville est connue pour la forteresse historique d'Afyon et son architecture traditionnelle. Elle est l'un des plus grands centres de tourisme thermal de Turquie.",
            culture: "Les habitants d'Afyon sont connus pour leur hospitalité et leur attachement aux valeurs traditionnelles. Le tissu culturel de la ville s'est formé au croisement du tourisme thermal et de l'agriculture. Elle est aussi réputée pour ses spécialités locales comme le lokum et le kaymak d'Afyon.",
        },
    },
    aksaray: {
        description: "Un design qui porte la riche histoire et le patrimoine culturel d'Aksaray. L'atmosphère envoûtante de cette ville, porte de la Cappadoce.",
        donationText: donation("Aksaray"),
        designOrigin: "La Grande Mosquée d'Aksaray et le bazar historique",
        cityInfo: {
            general: "Aksaray est une ville historique de la région d'Anatolie centrale. Connue comme la porte de la Cappadoce, la ville est célèbre pour ses cheminées de fées et ses villes souterraines. Elle abrite d'importants monuments des époques seldjoukide et ottomane.",
            culture: "Les habitants d'Aksaray ont à cœur de préserver leur patrimoine historique. La vie culturelle de la ville a été façonnée par le tourisme et l'agriculture. L'artisanat traditionnel et la culture culinaire locale restent bien vivants.",
        },
    },
    ardahan: {
        description: "Un design qui reflète l'atmosphère froide mais chaleureuse d'Ardahan. La nature unique et la richesse culturelle de l'Anatolie orientale.",
        donationText: donation("Ardahan"),
        designOrigin: "La forteresse d'Ardahan et le poste-frontière de Posof",
        cityInfo: {
            general: "Ardahan est une ville de la région d'Anatolie orientale, située à la frontière avec la Géorgie. Elle est connue pour son climat froid et ses beautés naturelles. Avec la forteresse historique d'Ardahan et les espaces naturels qui l'entourent, la ville enchante ses visiteurs.",
            culture: "Les habitants d'Ardahan sont connus pour leur culture de solidarité et d'entraide. En tant que ville frontalière, elle possède un caractère multiculturel. La musique et la danse traditionnelles, la cuisine locale et l'artisanat y sont toujours vivants.",
        },
    },
    gaziantep: {
        description: "Un design qui porte la riche culture culinaire et le patrimoine historique de Gaziantep. La ville des pistaches et du travail du cuivre.",
        donationText: donation("Gaziantep"),
        designOrigin: "La forteresse de Gaziantep et les mosaïques de Zeugma",
        cityInfo: {
            general: "Gaziantep est l'une des plus grandes villes de l'Anatolie du Sud-Est. Titulaire du titre de Ville de la gastronomie de l'UNESCO, la ville est connue pour sa riche culture culinaire et son patrimoine historique. Elle est célèbre pour ses pistaches, son baklava et ses nombreuses variétés de kebab.",
            culture: "Les habitants de Gaziantep sont connus pour leur esprit d'entreprise dans le commerce et l'industrie. La vie culturelle de la ville s'est formée au croisement de l'artisanat traditionnel et de l'industrie moderne. Son hospitalité et ses saveurs locales séduisent les visiteurs.",
        },
    },
    karaman: {
        description: "Un design qui reflète l'atmosphère de Karaman, centre de la culture turque traditionnelle. La ville de Yunus Emre.",
        donationText: donation("Karaman"),
        designOrigin: "La forteresse de Karaman et le mausolée de Yunus Emre",
        cityInfo: {
            general: "Située dans la région d'Anatolie centrale, Karaman est l'un des centres importants de la culture turque. Connue comme la ville de Yunus Emre, Karaman est réputée pour sa culture soufie et ses valeurs turques traditionnelles. La ville enchante ses visiteurs par son patrimoine historique et culturel.",
            culture: "Les habitants de Karaman sont connus pour leur attachement à la culture turque traditionnelle et leur respect des valeurs religieuses. La vie culturelle de la ville s'est formée au croisement de la tradition soufie et de la vie moderne. La philosophie de Yunus Emre vit encore dans le tissu social de la ville.",
        },
    },
    kayseri: {
        description: "Un design qui reflète l'atmosphère dynamique de Kayseri, ville de commerce. Le mont Erciyes et une culture marchande traditionnelle.",
        donationText: donation("Kayseri"),
        designOrigin: "Le mont Erciyes et la forteresse de Kayseri",
        cityInfo: {
            general: "Kayseri est l'un des centres commerciaux et industriels importants d'Anatolie centrale. Fondée au pied du mont Erciyes, la ville est connue pour la forteresse historique de Kayseri et sa culture marchande traditionnelle. C'est une ville dynamique où se rencontrent industrie moderne et valeurs traditionnelles.",
            culture: "Les habitants de Kayseri sont connus pour leur réussite dans le commerce et l'entrepreneuriat. La vie culturelle de la ville a été façonnée par l'éthique marchande traditionnelle et l'influence du monde des affaires moderne. La beauté naturelle du mont Erciyes se reflète aussi dans la vie sociale de la ville.",
        },
    },
    konya: {
        description: "Un design qui porte la culture profonde de Konya, centre spirituel. La ville de Mevlana et de la tradition soufie.",
        donationText: donation("Konya"),
        designOrigin: "Le mausolée de Mevlana et la forteresse de Konya",
        cityInfo: {
            general: "Konya est une ville historique connue comme le centre spirituel de l'Anatolie centrale. Reconnue comme la ville de Mevlana, Konya est célèbre pour sa culture soufie et ses valeurs spirituelles. La ville enchante ses visiteurs par son architecture seldjoukide et son patrimoine historique.",
            culture: "Les habitants de Konya sont connus pour leur attachement aux valeurs spirituelles et leur respect de la tradition soufie. La vie culturelle de la ville est née de l'union harmonieuse entre la philosophie de Mevlana et la vie moderne. La musique et les arts traditionnels y sont toujours vivants.",
        },
    },
    nevsehir: {
        description: "Un design qui reflète les cheminées de fées de Nevşehir et l'atmosphère magique de la Cappadoce. Merveilles naturelles et sites historiques.",
        donationText: donation("Nevşehir"),
        designOrigin: "Les cheminées de fées et les paysages de Cappadoce",
        cityInfo: {
            general: "Nevşehir est une ville magique au cœur de la région de Cappadoce. Célèbre pour ses cheminées de fées et ses villes souterraines, la ville enchante ses visiteurs par ses merveilles naturelles et ses sites historiques. Elle est le centre de la Cappadoce, inscrite sur la liste du patrimoine mondial de l'UNESCO.",
            culture: "Les habitants de Nevşehir sont connus pour leur expérience du tourisme et leur volonté de préserver leur patrimoine naturel. La vie culturelle de la ville s'est formée au croisement de l'artisanat traditionnel et des services touristiques modernes. La magie des cheminées de fées se reflète aussi dans la vie sociale de la ville.",
        },
    },
    sivas: {
        description: "Un design qui porte la riche histoire de Sivas, capitale culturelle de l'Anatolie. Architecture seldjoukide et artisanat traditionnel.",
        donationText: donation("Sivas"),
        designOrigin: "La forteresse de Sivas et la Çifte Minareli Medrese",
        cityInfo: {
            general: "Sivas est une ville historique connue comme la capitale culturelle de l'Anatolie centrale. Abritant certains des plus beaux exemples de l'architecture seldjoukide, la ville est connue pour la Çifte Minareli Medrese et sa forteresse historique. Elle est réputée pour son artisanat traditionnel et son patrimoine culturel.",
            culture: "Les habitants de Sivas sont connus pour leur attachement aux valeurs culturelles et leur intérêt pour l'artisanat traditionnel. La vie culturelle de la ville est née de l'union harmonieuse entre l'héritage seldjoukide et la vie moderne. La musique traditionnelle et le folklore y sont toujours vivants.",
        },
    },
    trabzon: {
        description: "Un design qui reflète la nature verdoyante de Trabzon, perle de la mer Noire. Uzungöl et la culture traditionnelle de la mer Noire.",
        donationText: donation("Trabzon"),
        designOrigin: "Uzungöl et la forteresse de Trabzon",
        cityInfo: {
            general: "Trabzon, surnommée la perle de la mer Noire, est célèbre pour sa nature verdoyante. Connue pour Uzungöl et la forteresse historique de Trabzon, la ville enchante ses visiteurs par ses beautés naturelles et la culture traditionnelle de la mer Noire. Elle offre une magnifique alliance de panoramas marins et montagneux.",
            culture: "Les habitants de Trabzon portent les traits caractéristiques de la mer Noire. La vie culturelle de la ville a été façonnée par les danses traditionnelles horon et la musique locale. Elle est connue pour son hospitalité et son harmonie avec la nature.",
        },
    },
    yozgat: {
        description: "Un design qui reflète le patrimoine historique et l'architecture traditionnelle de Yozgat. La richesse culturelle de l'Anatolie centrale.",
        donationText: donation("Yozgat"),
        designOrigin: "La forteresse de Yozgat et l'architecture traditionnelle",
        cityInfo: {
            general: "Yozgat est l'une des villes importantes de la région d'Anatolie centrale. Connue pour son patrimoine historique et son architecture traditionnelle, la ville occupe une place importante dans l'agriculture et l'élevage. Elle séduit ses visiteurs par son patrimoine culturel et ses beautés naturelles.",
            culture: "Les habitants de Yozgat sont connus pour leur attachement aux valeurs traditionnelles et leur hospitalité. La vie culturelle de la ville a été façonnée par les festivals locaux et l'artisanat traditionnel. L'agriculture et l'élevage forment le tissu social de la ville.",
        },
    },
    ankara: {
        description: "Un design qui unit l'identité de capitale moderne d'Ankara à son patrimoine historique. La ville d'Atatürk et le cœur de la Turquie.",
        donationText: donation("Ankara"),
        designOrigin: "L'Anıtkabir et la forteresse d'Ankara",
        cityInfo: {
            general: "Ankara est la capitale de la Turquie et sa deuxième plus grande ville. Alliant modernité et patrimoine historique, la ville est non seulement le centre politique, mais aussi le cœur de la vie culturelle et sociale. Elle est connue pour l'Anıtkabir, la forteresse d'Ankara et son architecture moderne.",
            culture: "La population d'Ankara forme une société dynamique composée de personnes issues de cultures diverses. La ville est un lieu où le mode de vie moderne rencontre les valeurs traditionnelles. Elle joue un rôle important dans l'éducation, les arts et la culture.",
        },
    },
    aydin: {
        description: "Un design qui reflète les terres fertiles de l'Égée et l'histoire antique d'Aydın. Le pays des olives et des figues.",
        donationText: donation("Aydın"),
        designOrigin: "La cité antique d'Éphèse et la nature égéenne",
        cityInfo: {
            general: "Aydın est une ville historique située sur les terres fertiles de la région égéenne. Connue pour la cité antique d'Éphèse et ses riches terres agricoles, la ville occupe une place importante dans le tourisme et l'agriculture. Le climat chaud de l'Égée et ses beautés naturelles rendent la ville attrayante.",
            culture: "Les habitants d'Aydın ont le caractère chaleureux et hospitalier de l'Égée. La vie culturelle de la ville s'est formée au croisement de l'héritage antique et du mode de vie moderne. La culture de l'olive, de la figue et du raisin forme le tissu social de la ville.",
        },
    },
    gumushane: {
        description: "Un design qui reflète la nature montagneuse et les mines d'argent historiques de Gümüşhane. Un trésor caché sur les hauteurs de la mer Noire.",
        donationText: donation("Gümüşhane"),
        designOrigin: "Les mines d'argent et la nature montagneuse",
        cityInfo: {
            general: "Gümüşhane est une ville historique située dans la partie montagneuse de la région de la mer Noire. Connue pour ses mines d'argent historiques et ses beautés naturelles, la ville possède une géographie unique grâce à son altitude élevée. Elle séduit ses visiteurs par son histoire minière et ses richesses naturelles.",
            culture: "Les habitants de Gümüşhane forment une communauté résistante et travailleuse, habituée aux rigueurs de la vie en montagne. La vie culturelle de la ville s'est formée autour de la tradition minière, en harmonie avec la nature. L'artisanat traditionnel et la musique locale y occupent une place importante.",
        },
    },
    nigde: {
        description: "Un design qui reflète la nature unique et le patrimoine historique de la Cappadoce à Niğde. Cheminées de fées et histoire antique.",
        donationText: donation("Niğde"),
        designOrigin: "Les cheminées de fées de Cappadoce et la forteresse de Niğde",
        cityInfo: {
            general: "Niğde est l'une des villes importantes de la région de Cappadoce. Célèbre pour ses cheminées de fées et son histoire antique, la ville occupe une place importante dans le tourisme et l'agriculture. Les formations naturelles uniques et le patrimoine historique de la Cappadoce rendent la ville attrayante.",
            culture: "Les habitants de Niğde forment une communauté qui préserve le patrimoine historique de la Cappadoce et reste attachée aux valeurs culturelles. La vie culturelle de la ville s'est formée au croisement de l'héritage antique et du mode de vie moderne. Le tourisme et l'artisanat traditionnel y occupent une place importante.",
        },
    },
    rize: {
        description: "Un design qui reflète les jardins de thé de Rize et la nature verdoyante de la mer Noire. Le berceau du thé et des beautés naturelles.",
        donationText: donation("Rize"),
        designOrigin: "Les jardins de thé et la nature de la mer Noire",
        cityInfo: {
            general: "Rize est une ville célèbre pour sa nature verdoyante, connue comme le centre de production de thé de la région de la mer Noire. Réputée pour ses jardins de thé et son relief montagneux, la ville occupe une place importante dans l'agriculture et le tourisme. Le climat humide de la mer Noire et ses terres fertiles rendent la ville attrayante.",
            culture: "Les habitants de Rize portent la culture du thé et les traits caractéristiques de la mer Noire. La vie culturelle de la ville s'est formée autour de la tradition de la production de thé, en harmonie avec la nature. Les danses traditionnelles horon et la musique locale y occupent une place importante.",
        },
    },
    corum: {
        description: "Un design qui reflète le patrimoine historique de Çorum, cœur de la civilisation hittite. Histoire antique et culture traditionnelle.",
        donationText: donation("Çorum"),
        designOrigin: "Hattusa et la civilisation hittite",
        cityInfo: {
            general: "Çorum est une ville historique qui abrite Hattusa, la capitale de la civilisation hittite. Connue pour son histoire antique et ses richesses archéologiques, la ville est un centre culturel important inscrit sur la liste du patrimoine mondial de l'UNESCO. Elle enchante ses visiteurs par un patrimoine historique qui porte les traces de la civilisation hittite.",
            culture: "Les habitants de Çorum forment une communauté qui préserve son patrimoine historique et reste attachée aux valeurs culturelles. La vie culturelle de la ville s'est formée au croisement des traces de la civilisation hittite et de la vie moderne. Le tourisme archéologique et l'artisanat traditionnel y occupent une place importante.",
        },
    },
    usak: {
        description: "Un design qui reflète l'atmosphère paisible d'Uşak, dans l'intérieur de l'Égée. Tissage traditionnel de tapis et beautés naturelles.",
        donationText: donation("Uşak"),
        designOrigin: "Les tapis d'Uşak et le tissage traditionnel",
        cityInfo: {
            general: "Uşak est une ville de l'intérieur de la région égéenne, célèbre pour son tissage traditionnel de tapis. Les tapis d'Uşak sont des pièces artisanales connues dans le monde entier. La ville séduit ses visiteurs par ses beautés naturelles et sa culture traditionnelle.",
            culture: "Les habitants d'Uşak sont connus pour leur intérêt pour l'artisanat traditionnel et leur maîtrise du tissage de tapis. La vie culturelle de la ville est née de l'union harmonieuse entre la culture du tissage traditionnel et la vie moderne. L'artisanat et la musique locale y occupent une place importante.",
        },
    },
    kirsehir: {
        description: "Un design qui reflète la culture soufie de Kırşehir, la ville d'Ahi Evran. La tradition Ahi et les valeurs spirituelles.",
        donationText: donation("Kırşehir"),
        designOrigin: "Ahi Evran et la tradition Ahi",
        cityInfo: {
            general: "Kırşehir est une ville historique connue comme la ville d'Ahi Evran et le centre de la tradition Ahi. Réputée pour sa culture soufie et ses valeurs spirituelles, la ville est l'un des centres importants de la culture turque traditionnelle. Elle séduit ses visiteurs par son atmosphère spirituelle et son patrimoine culturel.",
            culture: "Les habitants de Kırşehir sont connus pour leur attachement à la culture soufie et leur respect des valeurs spirituelles. La vie culturelle de la ville s'est formée au croisement de la tradition Ahi et de la vie moderne. La musique traditionnelle et le folklore y sont toujours vivants.",
        },
    },
    sakarya: {
        description: "Un design qui reflète les terres fertiles et les beautés naturelles de la région de Marmara à Sakarya. Le lac de Sapanca et une nature verdoyante.",
        donationText: donation("Sakarya"),
        designOrigin: "Le lac de Sapanca et le fleuve Sakarya",
        cityInfo: {
            general: "Sakarya est l'une des villes de la région de Marmara célèbres pour leurs beautés naturelles. Connue pour le lac de Sapanca et le fleuve Sakarya, la ville occupe une place importante dans l'agriculture et l'industrie. L'alliance de ses beautés naturelles et d'un mode de vie moderne rend la ville attrayante.",
            culture: "Les habitants de Sakarya sont connus pour leur harmonie avec la nature et leur adoption d'un mode de vie moderne. La vie culturelle de la ville est née de l'union harmonieuse entre beautés naturelles et vie urbaine. Les sports nautiques et le tourisme de nature y occupent une place importante.",
        },
    },
    agri: {
        description: "Un design qui reflète la majesté du mont Ağrı (Ararat), le plus haut sommet de Turquie. Les beautés naturelles de l'Anatolie orientale.",
        donationText: donation("Ağrı"),
        designOrigin: "Le mont Ağrı (Ararat) et la nature de l'Anatolie orientale",
        cityInfo: {
            general: "Ağrı est une ville célèbre pour ses beautés naturelles, fondée au pied du mont Ağrı (Ararat), le plus haut sommet de Turquie. Portant les traits caractéristiques de l'Anatolie orientale, la ville est un centre important pour l'alpinisme et les sports de nature. Elle enchante ses visiteurs par ses paysages naturels majestueux.",
            culture: "Les habitants d'Ağrı forment une communauté résistante et travailleuse, habituée aux rigueurs de la vie en montagne. La vie culturelle de la ville s'est formée en harmonie avec la nature. L'alpinisme et l'artisanat traditionnel y occupent une place importante.",
        },
    },
    // Hasret Collection (organization names are proper names and stay as they are)
    "gurbetten-memlekete": {
        description: "Un design qui reflète la nostalgie du pays natal des Turcs vivant à l'étranger. Le mal du pays au cœur de ceux qui vivent sur des terres lointaines.",
        donationText: "Gurbetçi Hayvan Dostları",
        designOrigin: "La culture de la diaspora et les liens avec le pays natal",
    },
    "sıla-yolu": {
        description: "Un design qui porte la longue route du retour et le désir des Turcs de l'étranger de rentrer chez eux. Un souvenir à chaque kilomètre.",
        donationText: "Sıla Yolu Hayvan Barınağı",
        designOrigin: "Les routes de la diaspora et la nostalgie du pays natal",
    },
    yabanci: {
        description: "Un design qui reflète la quête d'identité et l'appartenance culturelle des Turcs vivant en terre étrangère.",
        donationText: "Yabancı Diyarlar Hayvan Koruma",
        designOrigin: "L'identité culturelle et le sentiment d'appartenance",
    },
    // Sinema Collection
    devam: {
        description: "Un design spécial portant la réplique « Devam », inspirée du cinéma turc.",
        donationText: donationGeneric,
        designOrigin: "Le cinéma turc",
    },
    recep_to_my_sibel: {
        description: "Un design romantique inspiré du cinéma turc.",
        donationText: donationGeneric,
        designOrigin: "Le cinéma turc",
    },
    sensiz_olmaz: {
        description: "Un design spécial inspiré du cinéma turc.",
        donationText: donationGeneric,
        designOrigin: "Le cinéma turc",
    },
    sibel_to_my_recep: {
        description: "Un design romantique inspiré du cinéma turc.",
        donationText: donationGeneric,
        designOrigin: "Le cinéma turc",
    },
    // Turkish Time Collection
    "turkish-time-cay": {
        description: "Impression au dos : un verre à thé fumant en forme de tulipe, avec sa cuillère, sur une soucoupe décorée. En dessous, la phrase « You met me at a very Turkish time in my life. »",
        donationText: donationGeneric,
        designOrigin: "Le verre à thé turc",
    },
    "turkish-time-kurt": {
        description: "Impression au dos : un loup qui court. En dessous, la phrase « You met me at a very Turkish time in my life. »",
        donationText: donationGeneric,
        designOrigin: "Un loup qui court",
    },
    // New cities
    denizli: {
        description: richHeritage("de Denizli"),
        donationText: donation("Denizli"),
        designOrigin: cityFeatures("de Denizli"),
    },
    erzurum: {
        description: coldButWarm("d'Erzurum"),
        donationText: donation("Erzurum"),
        designOrigin: cityFeatures("d'Erzurum"),
    },
    giresun: {
        description: blackSeaBeauty("Giresun"),
        donationText: donation("Giresun"),
        designOrigin: cityFeatures("de Giresun"),
    },
    kahramanmaras: {
        description: "Un design qui reflète le riche patrimoine culturel de Kahramanmaraş.",
        donationText: donation("Kahramanmaraş"),
        designOrigin: cityFeatures("de Kahramanmaraş"),
    },
    kars: {
        description: coldButWarm("de Kars"),
        donationText: donation("Kars"),
        designOrigin: cityFeatures("de Kars"),
    },
    mardin: {
        description: "Un design qui reflète l'architecture unique et la richesse culturelle de Mardin.",
        donationText: donation("Mardin"),
        designOrigin: cityFeatures("de Mardin"),
    },
    ordu: {
        description: blackSeaBeauty("Ordu"),
        donationText: donation("Ordu"),
        designOrigin: cityFeatures("d'Ordu"),
    },
    samsun: {
        description: blackSeaBeauty("Samsun"),
        donationText: donation("Samsun"),
        designOrigin: cityFeatures("de Samsun"),
    },
    sanliurfa: {
        description: richHeritage("de Şanlıurfa"),
        donationText: donation("Şanlıurfa"),
        designOrigin: cityFeatures("de Şanlıurfa"),
    },
    zonguldak: {
        description: blackSeaBeauty("Zonguldak"),
        donationText: donation("Zonguldak"),
        designOrigin: cityFeatures("de Zonguldak"),
    },
};

export default products;
