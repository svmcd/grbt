import type { CatalogTranslations } from "./types";

const donation = (city: string) =>
    `5 % des Gewinns aus diesem T-Shirt werden an eine Tierhilfeorganisation in ${city} gespendet. Wir werden eine lokale Organisation finden. Wenn Sie jedoch eine gute Organisation kennen, lassen Sie es uns wissen: info@egrikuyu.com`;

const donationGeneric =
    "5 % des Gewinns aus diesem T-Shirt werden an eine Tierhilfeorganisation gespendet. Wir werden eine lokale Organisation finden. Wenn Sie jedoch eine gute Organisation kennen, lassen Sie es uns wissen: info@egrikuyu.com";

const cityFeatures = (city: string) => `Die historischen und kulturellen Besonderheiten von ${city}`;
const blackSeaBeauty = (city: string) => `Ein Design, das die einzigartigen Schönheiten der Schwarzmeerregion in ${city} widerspiegelt.`;
const coldButWarm = (city: string) => `Ein Design, das die kalte, aber herzliche Atmosphäre von ${city} widerspiegelt.`;
const richHeritage = (city: string) => `Ein Design, das die reiche Geschichte und das kulturelle Erbe von ${city} widerspiegelt.`;

const products: CatalogTranslations = {
    afyon: {
        description: "Ein Design, das den Geist von Afyon einfängt, einer Stadt, die für ihr historisches Stadtbild und ihre Thermalquellen berühmt ist. Hier treffen traditionelle Architektur und Naturschönheit aufeinander.",
        donationText: donation("Afyon"),
        designOrigin: "Burg Afyon und die Thermalquellen",
        cityInfo: {
            general: "Afyon ist eine der bedeutenden Städte der Ägäisregion. Die Stadt ist berühmt für ihre Thermalquellen und bekannt für die historische Burg Afyon und ihre traditionelle Architektur. Sie ist eines der größten Zentren des Thermaltourismus in der Türkei.",
            culture: "Die Menschen in Afyon sind für ihre Gastfreundschaft und ihre Verbundenheit mit traditionellen Werten bekannt. Das kulturelle Gefüge der Stadt ist von einer Verbindung aus Thermaltourismus und Landwirtschaft geprägt. Berühmt ist sie auch für lokale Spezialitäten wie Afyon-Lokum und Kaymak.",
        },
    },
    aksaray: {
        description: "Ein Design, das die reiche Geschichte und das kulturelle Erbe von Aksaray in sich trägt. Die faszinierende Atmosphäre dieser Stadt, des Tors nach Kappadokien.",
        donationText: donation("Aksaray"),
        designOrigin: "Große Moschee von Aksaray und der historische Basar",
        cityInfo: {
            general: "Aksaray ist eine historische Stadt in der Region Zentralanatolien. Die als Tor nach Kappadokien bekannte Stadt ist berühmt für ihre Feenkamine und unterirdischen Städte. Sie beherbergt bedeutende Bauwerke aus seldschukischer und osmanischer Zeit.",
            culture: "Die Menschen in Aksaray legen großen Wert auf die Bewahrung ihres historischen Erbes. Das kulturelle Leben der Stadt ist von Tourismus und Landwirtschaft geprägt. Traditionelles Kunsthandwerk und die lokale Esskultur sind bis heute lebendig.",
        },
    },
    ardahan: {
        description: "Ein Design, das die kalte, aber herzliche Atmosphäre von Ardahan widerspiegelt. Die einzigartige Natur und der kulturelle Reichtum Ostanatoliens.",
        donationText: donation("Ardahan"),
        designOrigin: "Burg Ardahan und der Grenzübergang Posof",
        cityInfo: {
            general: "Ardahan ist eine Stadt in der Region Ostanatolien an der Grenze zu Georgien. Sie ist für ihr kaltes Klima und ihre Naturschönheiten bekannt. Mit der historischen Burg Ardahan und den umliegenden Naturgebieten verzaubert die Stadt ihre Besucher.",
            culture: "Die Menschen in Ardahan sind für ihre Kultur der Solidarität und gegenseitigen Hilfe bekannt. Als Grenzstadt ist sie multikulturell geprägt. Traditionelle Musik und Tänze, die lokale Küche und das Kunsthandwerk werden bis heute gepflegt.",
        },
    },
    gaziantep: {
        description: "Ein Design, das die reiche Esskultur und das historische Stadtbild von Gaziantep in sich trägt. Die Stadt der Pistazien und der Kupferschmiedekunst.",
        donationText: donation("Gaziantep"),
        designOrigin: "Burg Gaziantep und die Mosaike von Zeugma",
        cityInfo: {
            general: "Gaziantep ist eine der größten Städte Südostanatoliens. Die Stadt trägt den Titel UNESCO-Stadt der Gastronomie und ist für ihre reiche Esskultur und ihr historisches Stadtbild bekannt. Berühmt ist sie für Pistazien, Baklava und ihre vielen Kebabsorten.",
            culture: "Die Menschen in Gaziantep sind für ihren Unternehmergeist in Handel und Industrie bekannt. Das kulturelle Leben der Stadt ist von einer Verbindung aus traditionellem Kunsthandwerk und moderner Industrie geprägt. Mit ihrer Gastfreundschaft und ihren lokalen Spezialitäten begeistert sie ihre Besucher.",
        },
    },
    karaman: {
        description: "Ein Design, das die Atmosphäre von Karaman widerspiegelt, einem Zentrum der traditionellen türkischen Kultur. Die Stadt von Yunus Emre.",
        donationText: donation("Karaman"),
        designOrigin: "Burg Karaman und das Grabmal von Yunus Emre",
        cityInfo: {
            general: "Karaman liegt in der Region Zentralanatolien und ist eines der wichtigen Zentren der türkischen Kultur. Als Stadt von Yunus Emre bekannt, steht Karaman für die Sufi-Kultur und traditionelle türkische Werte. Mit ihrem historischen Stadtbild und ihrem kulturellen Erbe verzaubert die Stadt ihre Besucher.",
            culture: "Die Menschen in Karaman sind für ihre Verbundenheit mit der traditionellen türkischen Kultur und ihren Respekt vor religiösen Werten bekannt. Das kulturelle Leben der Stadt ist von einer Verbindung aus Sufi-Tradition und modernem Leben geprägt. Die Philosophie von Yunus Emre lebt bis heute im sozialen Gefüge der Stadt fort.",
        },
    },
    kayseri: {
        description: "Ein Design, das die dynamische Atmosphäre der Handelsstadt Kayseri widerspiegelt. Der Berg Erciyes und eine traditionelle Handelskultur.",
        donationText: donation("Kayseri"),
        designOrigin: "Berg Erciyes und Burg Kayseri",
        cityInfo: {
            general: "Kayseri ist eines der wichtigen Handels- und Industriezentren Zentralanatoliens. Die am Fuß des Erciyes gegründete Stadt ist für die historische Burg Kayseri und ihre traditionelle Handelskultur bekannt. Sie ist dynamisch geprägt: Moderne Industrie und traditionelle Werte gehen hier zusammen.",
            culture: "Die Menschen in Kayseri sind für ihren Erfolg in Handel und Unternehmertum bekannt. Das kulturelle Leben der Stadt ist von traditioneller Handelsethik und dem Einfluss der modernen Geschäftswelt geprägt. Die Naturschönheit des Erciyes spiegelt sich auch im sozialen Leben der Stadt wider.",
        },
    },
    konya: {
        description: "Ein Design, das die tiefe Kultur von Konya, einem spirituellen Zentrum, in sich trägt. Die Stadt Mevlanas und der Sufi-Tradition.",
        donationText: donation("Konya"),
        designOrigin: "Mevlana-Mausoleum und Burg Konya",
        cityInfo: {
            general: "Konya ist eine historische Stadt, die als spirituelles Zentrum Zentralanatoliens gilt. Als Stadt Mevlanas bekannt, ist Konya berühmt für ihre Sufi-Kultur und ihre spirituellen Werte. Mit seldschukischer Architektur und ihrem historischen Stadtbild verzaubert die Stadt ihre Besucher.",
            culture: "Die Menschen in Konya sind für ihre Verbundenheit mit spirituellen Werten und ihren Respekt vor der Sufi-Tradition bekannt. Das kulturelle Leben der Stadt ist von der harmonischen Verbindung der Philosophie Mevlanas mit dem modernen Leben geprägt. Traditionelle Musik und Kunst werden bis heute gepflegt.",
        },
    },
    nevsehir: {
        description: "Ein Design, das die Feenkamine von Nevşehir und die zauberhafte Atmosphäre Kappadokiens widerspiegelt. Naturwunder und historische Stätten.",
        donationText: donation("Nevşehir"),
        designOrigin: "Feenkamine und die Landschaft Kappadokiens",
        cityInfo: {
            general: "Nevşehir ist eine zauberhafte Stadt im Herzen der Region Kappadokien. Berühmt für ihre Feenkamine und unterirdischen Städte, verzaubert die Stadt ihre Besucher mit Naturwundern und historischen Stätten. Sie ist das Zentrum Kappadokiens, das auf der Liste des UNESCO-Welterbes steht.",
            culture: "Die Menschen in Nevşehir sind für ihre Erfahrung im Tourismus und ihr Bewusstsein für den Schutz ihres Naturerbes bekannt. Das kulturelle Leben der Stadt ist von einer Verbindung aus traditionellem Kunsthandwerk und modernen Tourismusangeboten geprägt. Der Zauber der Feenkamine spiegelt sich auch im sozialen Leben der Stadt wider.",
        },
    },
    sivas: {
        description: "Ein Design, das die reiche Geschichte von Sivas, der Kulturhauptstadt Anatoliens, in sich trägt. Seldschukische Architektur und traditionelles Kunsthandwerk.",
        donationText: donation("Sivas"),
        designOrigin: "Burg Sivas und die Çifte Minareli Medrese",
        cityInfo: {
            general: "Sivas ist eine historische Stadt, die als Kulturhauptstadt Zentralanatoliens gilt. Die Stadt beherbergt einige der schönsten Beispiele seldschukischer Architektur und ist für die Çifte Minareli Medrese und ihre historische Burg bekannt. Berühmt ist sie für ihr traditionelles Kunsthandwerk und ihr kulturelles Erbe.",
            culture: "Die Menschen in Sivas sind für ihre Verbundenheit mit kulturellen Werten und ihr Interesse am traditionellen Kunsthandwerk bekannt. Das kulturelle Leben der Stadt ist von der harmonischen Verbindung des seldschukischen Erbes mit dem modernen Leben geprägt. Traditionelle Musik und Folklore werden bis heute gepflegt.",
        },
    },
    trabzon: {
        description: "Ein Design, das die grüne Natur von Trabzon, der Perle des Schwarzen Meeres, widerspiegelt. Uzungöl und die traditionelle Kultur der Schwarzmeerregion.",
        donationText: donation("Trabzon"),
        designOrigin: "Uzungöl und Burg Trabzon",
        cityInfo: {
            general: "Trabzon, bekannt als Perle des Schwarzen Meeres, ist für seine grüne Natur berühmt. Die für den Uzungöl und die historische Burg Trabzon bekannte Stadt verzaubert ihre Besucher mit ihren Naturschönheiten und der traditionellen Kultur der Schwarzmeerregion. Sie bietet eine großartige Verbindung von Meer- und Bergpanorama.",
            culture: "Die Menschen in Trabzon tragen die typischen Merkmale der Schwarzmeerregion in sich. Das kulturelle Leben der Stadt ist von den traditionellen Horon-Tänzen und der lokalen Musik geprägt. Bekannt ist sie für ihre Gastfreundschaft und ihren Einklang mit der Natur.",
        },
    },
    yozgat: {
        description: "Ein Design, das das historische Stadtbild und die traditionelle Architektur von Yozgat widerspiegelt. Der kulturelle Reichtum Zentralanatoliens.",
        donationText: donation("Yozgat"),
        designOrigin: "Burg Yozgat und traditionelle Architektur",
        cityInfo: {
            general: "Yozgat ist eine der bedeutenden Städte der Region Zentralanatolien. Die für ihr historisches Stadtbild und ihre traditionelle Architektur bekannte Stadt nimmt in Landwirtschaft und Viehzucht einen wichtigen Platz ein. Mit ihrem kulturellen Erbe und ihren Naturschönheiten beeindruckt sie ihre Besucher.",
            culture: "Die Menschen in Yozgat sind für ihre Verbundenheit mit traditionellen Werten und ihre Gastfreundschaft bekannt. Das kulturelle Leben der Stadt ist von lokalen Festen und traditionellem Kunsthandwerk geprägt. Landwirtschaft und Viehzucht bilden das soziale Gefüge der Stadt.",
        },
    },
    ankara: {
        description: "Ein Design, das die Identität Ankaras als moderne Hauptstadt mit ihrem historischen Stadtbild verbindet. Die Stadt Atatürks und das Herz der Türkei.",
        donationText: donation("Ankara"),
        designOrigin: "Anıtkabir und Burg Ankara",
        cityInfo: {
            general: "Ankara ist die Hauptstadt der Türkei und ihre zweitgrößte Stadt. Die Stadt verbindet ihren modernen Charakter mit ihrem historischen Stadtbild und ist nicht nur das politische Zentrum, sondern auch das Herz des kulturellen und gesellschaftlichen Lebens. Bekannt ist sie für Anıtkabir, die Burg Ankara und ihre moderne Architektur.",
            culture: "Die Bevölkerung Ankaras ist eine dynamische Gemeinschaft aus Menschen unterschiedlichster Kulturen. Die Stadt ist ein Ort, an dem moderner Lebensstil und traditionelle Werte zusammenkommen. In Bildung, Kunst und Kultur spielt sie eine wichtige Rolle.",
        },
    },
    aydin: {
        description: "Ein Design, das die fruchtbare Erde der Ägäis und die antike Geschichte von Aydın widerspiegelt. Das Land der Oliven und Feigen.",
        donationText: donation("Aydın"),
        designOrigin: "Die antike Stadt Ephesos und die Natur der Ägäis",
        cityInfo: {
            general: "Aydın ist eine historische Stadt auf dem fruchtbaren Boden der Ägäisregion. Die für die antike Stadt Ephesos und ihre reichen Agrarflächen bekannte Stadt nimmt in Tourismus und Landwirtschaft einen wichtigen Platz ein. Das warme Klima der Ägäis und ihre Naturschönheiten machen die Stadt anziehend.",
            culture: "Die Menschen in Aydın tragen den warmherzigen und gastfreundlichen Charakter der Ägäis in sich. Das kulturelle Leben der Stadt ist von einer Verbindung aus antikem Erbe und modernem Lebensstil geprägt. Die Kultur von Oliven, Feigen und Trauben bildet das soziale Gefüge der Stadt.",
        },
    },
    gumushane: {
        description: "Ein Design, das die gebirgige Natur und die historischen Silberminen von Gümüşhane widerspiegelt. Ein verborgener Schatz in den Höhen der Schwarzmeerregion.",
        donationText: donation("Gümüşhane"),
        designOrigin: "Silberminen und gebirgige Natur",
        cityInfo: {
            general: "Gümüşhane ist eine historische Stadt im gebirgigen Teil der Schwarzmeerregion. Die für ihre historischen Silberminen und Naturschönheiten bekannte Stadt hat durch ihre Höhenlage eine einzigartige Geografie. Mit ihrer Bergbaugeschichte und ihren natürlichen Reichtümern beeindruckt sie ihre Besucher.",
            culture: "Die Menschen in Gümüşhane sind eine widerstandsfähige und fleißige Gemeinschaft, die an die Härten des Lebens in den Bergen gewöhnt ist. Das kulturelle Leben der Stadt ist von der Bergbautradition und vom Einklang mit der Natur geprägt. Traditionelles Kunsthandwerk und lokale Musik haben einen wichtigen Stellenwert.",
        },
    },
    nigde: {
        description: "Ein Design, das die einzigartige Natur und das historische Erbe Kappadokiens in Niğde widerspiegelt. Feenkamine und antike Geschichte.",
        donationText: donation("Niğde"),
        designOrigin: "Die Feenkamine Kappadokiens und Burg Niğde",
        cityInfo: {
            general: "Niğde ist eine der bedeutenden Städte der Region Kappadokien. Die für ihre Feenkamine und ihre antike Geschichte berühmte Stadt nimmt in Tourismus und Landwirtschaft einen wichtigen Platz ein. Die einzigartigen Naturformationen und das historische Erbe Kappadokiens machen die Stadt anziehend.",
            culture: "Die Menschen in Niğde sind eine Gemeinschaft, die das historische Erbe Kappadokiens bewahrt und kulturellen Werten verbunden ist. Das kulturelle Leben der Stadt ist von einer Verbindung aus antikem Erbe und modernem Lebensstil geprägt. Tourismus und traditionelles Kunsthandwerk haben einen wichtigen Stellenwert.",
        },
    },
    rize: {
        description: "Ein Design, das die Teegärten von Rize und die grüne Natur der Schwarzmeerregion widerspiegelt. Die Heimat des Tees und Naturschönheiten.",
        donationText: donation("Rize"),
        designOrigin: "Teegärten und die Natur der Schwarzmeerregion",
        cityInfo: {
            general: "Rize ist eine für ihre grüne Natur berühmte Stadt und gilt als Zentrum des Teeanbaus in der Schwarzmeerregion. Die für ihre Teegärten und ihre gebirgige Landschaft bekannte Stadt nimmt in Landwirtschaft und Tourismus einen wichtigen Platz ein. Das feuchte Klima der Schwarzmeerregion und der fruchtbare Boden machen die Stadt anziehend.",
            culture: "Die Menschen in Rize tragen die Teekultur und die typischen Merkmale der Schwarzmeerregion in sich. Das kulturelle Leben der Stadt ist von der Tradition des Teeanbaus und vom Einklang mit der Natur geprägt. Traditionelle Horon-Tänze und lokale Musik haben einen wichtigen Stellenwert.",
        },
    },
    corum: {
        description: "Ein Design, das das historische Erbe von Çorum, dem Herzen der hethitischen Zivilisation, widerspiegelt. Antike Geschichte und traditionelle Kultur.",
        donationText: donation("Çorum"),
        designOrigin: "Hattuša und die hethitische Zivilisation",
        cityInfo: {
            general: "Çorum ist eine historische Stadt, in der Hattuša liegt, die Hauptstadt der hethitischen Zivilisation. Die für ihre antike Geschichte und ihre archäologischen Schätze bekannte Stadt ist ein bedeutendes kulturelles Zentrum auf der Liste des UNESCO-Welterbes. Mit ihrem historischen Erbe, das die Spuren der hethitischen Zivilisation trägt, verzaubert die Stadt ihre Besucher.",
            culture: "Die Menschen in Çorum sind eine Gemeinschaft, die ihr historisches Erbe bewahrt und kulturellen Werten verbunden ist. Das kulturelle Leben der Stadt ist von einer Verbindung aus den Spuren der hethitischen Zivilisation und modernem Leben geprägt. Archäologischer Tourismus und traditionelles Kunsthandwerk haben einen wichtigen Stellenwert.",
        },
    },
    usak: {
        description: "Ein Design, das die ruhige Atmosphäre von Uşak im Landesinneren der Ägäis widerspiegelt. Traditionelle Teppichweberei und Naturschönheiten.",
        donationText: donation("Uşak"),
        designOrigin: "Uşak-Teppiche und traditionelle Weberei",
        cityInfo: {
            general: "Uşak ist eine Stadt im Landesinneren der Ägäisregion, die für ihre traditionelle Teppichweberei berühmt ist. Uşak-Teppiche sind weltweit bekannte Erzeugnisse des Kunsthandwerks. Mit ihren Naturschönheiten und ihrer traditionellen Kultur beeindruckt die Stadt ihre Besucher.",
            culture: "Die Menschen in Uşak sind für ihr Interesse am traditionellen Kunsthandwerk und ihre Meisterschaft in der Teppichweberei bekannt. Das kulturelle Leben der Stadt ist von der harmonischen Verbindung der traditionellen Webkultur mit dem modernen Leben geprägt. Kunsthandwerk und lokale Musik haben einen wichtigen Stellenwert.",
        },
    },
    kirsehir: {
        description: "Ein Design, das die Sufi-Kultur von Kırşehir, der Stadt Ahi Evrans, widerspiegelt. Die Ahi-Tradition und spirituelle Werte.",
        donationText: donation("Kırşehir"),
        designOrigin: "Ahi Evran und die Ahi-Tradition",
        cityInfo: {
            general: "Kırşehir ist eine historische Stadt, die als Stadt Ahi Evrans und Zentrum der Ahi-Tradition bekannt ist. Die für ihre Sufi-Kultur und ihre spirituellen Werte bekannte Stadt ist eines der wichtigen Zentren der traditionellen türkischen Kultur. Mit ihrer spirituellen Atmosphäre und ihrem kulturellen Erbe beeindruckt sie ihre Besucher.",
            culture: "Die Menschen in Kırşehir sind für ihre Verbundenheit mit der Sufi-Kultur und ihren Respekt vor spirituellen Werten bekannt. Das kulturelle Leben der Stadt ist von einer Verbindung aus Ahi-Tradition und modernem Leben geprägt. Traditionelle Musik und Folklore werden bis heute gepflegt.",
        },
    },
    sakarya: {
        description: "Ein Design, das die fruchtbare Erde und die Naturschönheiten der Marmararegion in Sakarya widerspiegelt. Der Sapanca-See und grüne Natur.",
        donationText: donation("Sakarya"),
        designOrigin: "Sapanca-See und der Fluss Sakarya",
        cityInfo: {
            general: "Sakarya ist eine der für ihre Naturschönheiten berühmten Städte der Marmararegion. Die für den Sapanca-See und den Fluss Sakarya bekannte Stadt nimmt in Landwirtschaft und Industrie einen wichtigen Platz ein. Die Verbindung aus Naturschönheiten und modernem Lebensstil macht die Stadt anziehend.",
            culture: "Die Menschen in Sakarya sind für ihren Einklang mit der Natur und ihre Offenheit für einen modernen Lebensstil bekannt. Das kulturelle Leben der Stadt ist von der harmonischen Verbindung aus Naturschönheiten und städtischem Leben geprägt. Wassersport und Naturtourismus haben einen wichtigen Stellenwert.",
        },
    },
    agri: {
        description: "Ein Design, das die Erhabenheit des Bergs Ağrı (Ararat), des höchsten Bergs der Türkei, widerspiegelt. Die Naturschönheiten Ostanatoliens.",
        donationText: donation("Ağrı"),
        designOrigin: "Berg Ağrı (Ararat) und die Natur Ostanatoliens",
        cityInfo: {
            general: "Ağrı ist eine für ihre Naturschönheiten berühmte Stadt am Fuß des Bergs Ağrı (Ararat), des höchsten Bergs der Türkei. Die Stadt trägt die typischen Merkmale Ostanatoliens und ist ein wichtiges Zentrum für Bergsteigen und Natursport. Mit ihrer erhabenen Naturlandschaft verzaubert die Stadt ihre Besucher.",
            culture: "Die Menschen in Ağrı sind eine widerstandsfähige und fleißige Gemeinschaft, die an die Härten des Lebens in den Bergen gewöhnt ist. Das kulturelle Leben der Stadt hat sich im Einklang mit der Natur entwickelt. Bergsteigen und traditionelles Kunsthandwerk haben einen wichtigen Stellenwert.",
        },
    },
    // Hasret Collection (organization names are proper names and stay as they are)
    "gurbetten-memlekete": {
        description: "Ein Design, das die Sehnsucht der im Ausland lebenden Türken nach der Heimat widerspiegelt. Das Heimweh im Herzen derer, die in fernen Ländern leben.",
        donationText: "Gurbetçi Hayvan Dostları",
        designOrigin: "Diaspora-Kultur und die Bindung an die Heimat",
    },
    "sıla-yolu": {
        description: "Ein Design, das den langen Weg in die Heimat und die Sehnsucht der Auslandstürken nach der Heimkehr in sich trägt. Eine Erinnerung an jedem Kilometer.",
        donationText: "Sıla Yolu Hayvan Barınağı",
        designOrigin: "Die Wege der Diaspora und die Sehnsucht nach der Heimat",
    },
    yabanci: {
        description: "Ein Design, das das Ringen um Identität und die kulturelle Zugehörigkeit der in fremden Ländern lebenden Türken widerspiegelt.",
        donationText: "Yabancı Diyarlar Hayvan Koruma",
        designOrigin: "Kulturelle Identität und Zugehörigkeitsgefühl",
    },
    // Sinema Collection
    devam: {
        description: "Ein besonderes Design mit der vom türkischen Kino inspirierten Zeile „Devam“.",
        donationText: donationGeneric,
        designOrigin: "Türkisches Kino",
    },
    recep_to_my_sibel: {
        description: "Ein romantisches Design, inspiriert vom türkischen Kino.",
        donationText: donationGeneric,
        designOrigin: "Türkisches Kino",
    },
    sensiz_olmaz: {
        description: "Ein besonderes Design, inspiriert vom türkischen Kino.",
        donationText: donationGeneric,
        designOrigin: "Türkisches Kino",
    },
    sibel_to_my_recep: {
        description: "Ein romantisches Design, inspiriert vom türkischen Kino.",
        donationText: donationGeneric,
        designOrigin: "Türkisches Kino",
    },
    // Turkish Time Collection
    "turkish-time-cay": {
        description: "Frontdruck: ein dampfendes, tulpenförmiges Teeglas mit Löffel auf einer verzierten Untertasse. Darunter der Satz „You met me at a very Turkish time in my life.“",
        donationText: donationGeneric,
        designOrigin: "Das türkische Teeglas",
    },
    "turkish-time-bozkurt": {
        description: "Frontdruck: ein laufender grauer Wolf (Bozkurt). Darunter der Satz „You met me at a very Turkish time in my life.“",
        donationText: donationGeneric,
        designOrigin: "Ein laufender grauer Wolf",
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
        description: "Ein Design, das das reiche kulturelle Erbe von Kahramanmaraş widerspiegelt.",
        donationText: donation("Kahramanmaraş"),
        designOrigin: cityFeatures("Kahramanmaraş"),
    },
    kars: {
        description: coldButWarm("Kars"),
        donationText: donation("Kars"),
        designOrigin: cityFeatures("Kars"),
    },
    mardin: {
        description: "Ein Design, das die einzigartige Architektur und den kulturellen Reichtum von Mardin widerspiegelt.",
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
