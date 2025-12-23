export type Product = {
    slug: string;
    city: string;
    image: string;
    images: string[];
    colors: string[];
    sizes: string[];
    description: string;
    donation: {
        percentage: number;
        organization: string;
        link?: string;
    };
    designOrigin: string;
    cityInfo?: {
        general: string;
        culture: string;
    };
};

export const memleketSlugs: string[] = [
    "afyon",
    "agri",
    "aksaray",
    "ankara",
    "ardahan",
    "aydin",
    "corum",
    "gaziantep",
    "gumushane",
    "karaman",
    "kayseri",
    "kirsehir",
    "konya",
    "nevsehir",
    "nigde",
    "rize",
    "sakarya",
    "sivas",
    "trabzon",
    "usak",
    "yozgat",
];

export const hasretSlugs: string[] = [
    "gurbetten-memlekete",
    "sıla-yolu",
    "yabanci",
];

export function titleCaseCity(slug: string): string {
    if (!slug) return "";

    // Turkish city name mappings
    const cityNames: Record<string, string> = {
        "afyon": "Afyon",
        "agri": "Ağrı",
        "aksaray": "Aksaray",
        "ankara": "Ankara",
        "ardahan": "Ardahan",
        "aydin": "Aydın",
        "corum": "Çorum",
        "gaziantep": "Gaziantep",
        "gumushane": "Gümüşhane",
        "karaman": "Karaman",
        "kayseri": "Kayseri",
        "kirsehir": "Kırşehir",
        "konya": "Konya",
        "nevsehir": "Nevşehir",
        "nigde": "Niğde",
        "rize": "Rize",
        "sakarya": "Sakarya",
        "sivas": "Sivas",
        "trabzon": "Trabzon",
        "usak": "Uşak",
        "yozgat": "Yozgat",
        // Hasret collection
        "gurbetten-memlekete": "Gurbetten Memlekete",
        "sıla-yolu": "Sıla Yolu",
        "yabanci": "Yabancı"
    };

    return cityNames[slug] || slug.charAt(0).toUpperCase() + slug.slice(1);
}

export function getPrimaryImageForSlug(slug: string): string {
    // Determine collection based on slug
    const collection = hasretSlugs.includes(slug) ? "hasret" : "memleket";
    const base = `/products/collections/${collection}/${slug}/siyah`;

    // Special case for yabanci - use front.png as primary image
    if (slug === "yabanci") {
        return `${base}/front.png`;
    }

    // Both collections use back.png as primary image
    return `${base}/back.png`;
}

export function getImagesForSlug(slug: string, color: string = "siyah", productType: "tshirt" | "hoodie" | "sweater" = "tshirt"): string[] {
    // Determine collection based on slug
    const collection = hasretSlugs.includes(slug) ? "hasret" : "memleket";
    
    // Handle hoodie and sweater - use examples folder
    if (productType === "hoodie" || productType === "sweater") {
        const colorKey = color === "beyaz" ? "white" : "black";
        const productKey = productType === "hoodie" ? "hoodie" : "sweater";
        return [
            `/products/collections/memleket/examples/${productKey}_${colorKey}_front.png`,
            `/products/collections/memleket/examples/${productKey}_${colorKey}_back.png`,
        ];
    }
    
    // T-shirt images
    const base = `/products/collections/${collection}/${slug}/${color}`;
    const commonBase = `/products/collections/${collection}/${slug}/siyah`;

    if (collection === "hasret") {
        // Special case for yabanci - uses front.png instead of front.png
        if (slug === "yabanci") {
            const candidates = [
                `${base}/front.png`,
                `${base}/back.png`,
            ];
            return candidates;
        }

        // Other hasret products use front.png and back.png
        const candidates = [
            `${base}/front.png`,
            `${base}/back.png`,
        ];
        return candidates;
    }

    // Memleket collection
    const candidates = [
        `${base}/front.png`,
        `${base}/back.png`,
    ];

    // Add common images only if they exist (we'll check this on the frontend)
    const commonImages = [
        `${commonBase}/common1.png`,
        `${commonBase}/common2.png`,
        `${commonBase}/common3.png`,
    ];

    return [...candidates, ...commonImages];
}

export function getAvailableColors(): string[] {
    return ["siyah", "beyaz"];
}

// Product data configuration
const productData: Record<string, {
    description: string;
    donation: {
        percentage: number;
        organization: string;
        link?: string;
    };
    designOrigin: string;
    cityInfo?: {
        general: string;
        culture: string;
    };
}> = {
    afyon: {
        description: "Afyon'un tarihi dokusu ve termal kaynaklarıyla ünlü şehrinin ruhunu yansıtan tasarım. Geleneksel mimari ve doğal güzelliklerin buluşması.",
        donation: {
            percentage: 5,
            organization: "Bu tişörtten elde edilen kârın %5'i Afyon'daki bir hayvan bakım organizasyonuna bağışlanacaktır. Yerel bir organizasyon bulacağız - ancak iyi bir organizasyon biliyorsanız bize bildirin: info@grbt.studio"
        },
        designOrigin: "Afyon Kalesi ve termal kaynaklar",
        cityInfo: {
            general: "Afyon, Ege Bölgesi'nin önemli şehirlerinden biridir. Termal kaynaklarıyla ünlü olan şehir, tarihi Afyon Kalesi ve geleneksel mimarisiyle tanınır. Şehir, Türkiye'nin en büyük termal turizm merkezlerinden biridir.",
            culture: "Afyon halkı, misafirperverliği ve geleneksel değerlere bağlılığı ile bilinir. Şehrin kültürel dokusu, termal turizm ve tarım sektörlerinin harmanlanmasıyla şekillenmiştir. Afyon lokumu ve kaymağı gibi yerel lezzetleriyle de ünlüdür."
        }
    },
    aksaray: {
        description: "Aksaray'ın zengin tarihi ve kültürel mirasını taşıyan tasarım. Kapadokya'nın kapısı olan bu şehrin büyüleyici atmosferi.",
        donation: {
            percentage: 5,
            organization: "Bu tişörtten elde edilen kârın %5'i Aksaray'daki bir hayvan bakım organizasyonuna bağışlanacaktır. Yerel bir organizasyon bulacağız - ancak iyi bir organizasyon biliyorsanız bize bildirin: info@grbt.studio"
        },
        designOrigin: "Aksaray Ulu Camii ve tarihi çarşı",
        cityInfo: {
            general: "Aksaray, İç Anadolu Bölgesi'nde yer alan tarihi bir şehirdir. Kapadokya'nın giriş kapısı olarak bilinen şehir, peri bacaları ve yeraltı şehirleriyle ünlüdür. Selçuklu ve Osmanlı dönemlerinden kalma önemli eserlere ev sahipliği yapar.",
            culture: "Aksaray halkı, tarihi miraslarına sahip çıkma konusunda bilinçlidir. Şehrin kültürel yaşamı, turizm ve tarım sektörlerinin etkisiyle şekillenmiştir. Geleneksel el sanatları ve yerel mutfak kültürü hala canlılığını korumaktadır."
        }
    },
    ardahan: {
        description: "Ardahan'ın soğuk ama sıcak kalpli atmosferini yansıtan tasarım. Doğu Anadolu'nun eşsiz doğası ve kültürel zenginliği.",
        donation: {
            percentage: 5,
            organization: "Bu tişörtten elde edilen kârın %5'i Ardahan'daki bir hayvan bakım organizasyonuna bağışlanacaktır. Yerel bir organizasyon bulacağız - ancak iyi bir organizasyon biliyorsanız bize bildirin: info@grbt.studio"
        },
        designOrigin: "Ardahan Kalesi ve Posof sınır kapısı",
        cityInfo: {
            general: "Ardahan, Doğu Anadolu Bölgesi'nde yer alan ve Gürcistan sınırında bulunan bir şehirdir. Soğuk iklimi ve doğal güzellikleriyle tanınır. Şehir, tarihi Ardahan Kalesi ve çevresindeki doğal alanlarıyla ziyaretçilerini büyüler.",
            culture: "Ardahan halkı, dayanışma ve yardımlaşma kültürüyle bilinir. Sınır şehri olması nedeniyle çok kültürlü bir yapıya sahiptir. Geleneksel müzik ve dans kültürü, yerel mutfak ve el sanatları hala yaşatılmaktadır."
        }
    },
    gaziantep: {
        description: "Gaziantep'in zengin mutfak kültürü ve tarihi dokusunu taşıyan tasarım. Antep fıstığı ve bakır işçiliğinin şehri.",
        donation: {
            percentage: 5,
            organization: "Bu tişörtten elde edilen kârın %5'i Gaziantep'teki bir hayvan bakım organizasyonuna bağışlanacaktır. Yerel bir organizasyon bulacağız - ancak iyi bir organizasyon biliyorsanız bize bildirin: info@grbt.studio"
        },
        designOrigin: "Gaziantep Kalesi ve Zeugma mozaikleri",
        cityInfo: {
            general: "Gaziantep, Güneydoğu Anadolu'nun en büyük şehirlerinden biridir. UNESCO Gastronomi Şehri unvanına sahip olan şehir, zengin mutfak kültürü ve tarihi dokusuyla tanınır. Antep fıstığı, baklava ve kebap çeşitleriyle ünlüdür.",
            culture: "Gaziantep halkı, ticaret ve sanayi alanında girişimci ruhuyla bilinir. Şehrin kültürel yaşamı, geleneksel el sanatları ve modern sanayi sektörünün harmanlanmasıyla şekillenmiştir. Misafirperverliği ve yerel lezzetleriyle ziyaretçilerini büyüler."
        }
    },
    karaman: {
        description: "Karaman'ın geleneksel Türk kültürünün merkezi olan atmosferini yansıtan tasarım. Yunus Emre'nin şehri.",
        donation: {
            percentage: 5,
            organization: "Bu tişörtten elde edilen kârın %5'i Karaman'daki bir hayvan bakım organizasyonuna bağışlanacaktır. Yerel bir organizasyon bulacağız - ancak iyi bir organizasyon biliyorsanız bize bildirin: info@grbt.studio"
        },
        designOrigin: "Karaman Kalesi ve Yunus Emre Türbesi",
        cityInfo: {
            general: "Karaman, İç Anadolu Bölgesi'nde yer alan ve Türk kültürünün önemli merkezlerinden biridir. Yunus Emre'nin şehri olarak bilinen Karaman, tasavvuf kültürü ve geleneksel Türk değerleriyle tanınır. Şehir, tarihi dokusu ve kültürel mirasıyla ziyaretçilerini büyüler.",
            culture: "Karaman halkı, geleneksel Türk kültürüne bağlılığı ve dini değerlere saygısıyla bilinir. Şehrin kültürel yaşamı, tasavvuf geleneği ve modern yaşamın harmanlanmasıyla şekillenmiştir. Yunus Emre'nin felsefesi hala şehrin sosyal dokusunda yaşatılmaktadır."
        }
    },
    kayseri: {
        description: "Kayseri'nin ticaret merkezi olan dinamik atmosferini yansıtan tasarım. Erciyes Dağı ve geleneksel ticaret kültürü.",
        donation: {
            percentage: 5,
            organization: "Bu tişörtten elde edilen kârın %5'i Kayseri'deki bir hayvan bakım organizasyonuna bağışlanacaktır. Yerel bir organizasyon bulacağız - ancak iyi bir organizasyon biliyorsanız bize bildirin: info@grbt.studio"
        },
        designOrigin: "Erciyes Dağı ve Kayseri Kalesi",
        cityInfo: {
            general: "Kayseri, İç Anadolu'nun önemli ticaret ve sanayi merkezlerinden biridir. Erciyes Dağı'nın eteklerinde kurulmuş olan şehir, tarihi Kayseri Kalesi ve geleneksel ticaret kültürüyle tanınır. Şehir, modern sanayi ve geleneksel değerlerin harmanlandığı dinamik bir yapıya sahiptir.",
            culture: "Kayseri halkı, ticaret ve girişimcilik konusundaki başarısıyla bilinir. Şehrin kültürel yaşamı, geleneksel ticaret ahlakı ve modern iş dünyasının etkisiyle şekillenmiştir. Erciyes Dağı'nın doğal güzelliği şehrin sosyal yaşamına da yansır."
        }
    },
    konya: {
        description: "Konya'nın manevi merkez olan derin kültürünü taşıyan tasarım. Mevlana'nın şehri ve tasavvuf geleneği.",
        donation: {
            percentage: 5,
            organization: "Bu tişörtten elde edilen kârın %5'i Konya'daki bir hayvan bakım organizasyonuna bağışlanacaktır. Yerel bir organizasyon bulacağız - ancak iyi bir organizasyon biliyorsanız bize bildirin: info@grbt.studio"
        },
        designOrigin: "Mevlana Türbesi ve Konya Kalesi",
        cityInfo: {
            general: "Konya, İç Anadolu'nun manevi merkezi olarak bilinen tarihi bir şehirdir. Mevlana'nın şehri olarak tanınan Konya, tasavvuf kültürü ve manevi değerleriyle ünlüdür. Şehir, Selçuklu mimarisi ve tarihi dokusuyla ziyaretçilerini büyüler.",
            culture: "Konya halkı, manevi değerlere bağlılığı ve tasavvuf geleneğine saygısıyla bilinir. Şehrin kültürel yaşamı, Mevlana'nın felsefesi ve modern yaşamın uyumlu birleşimiyle şekillenmiştir. Geleneksel müzik ve sanat kültürü hala yaşatılmaktadır."
        }
    },
    nevsehir: {
        description: "Nevşehir'in peri bacaları ve Kapadokya'nın büyülü atmosferini yansıtan tasarım. Doğal harikalar ve tarihi dokular.",
        donation: {
            percentage: 5,
            organization: "Bu tişörtten elde edilen kârın %5'i Nevşehir'deki bir hayvan bakım organizasyonuna bağışlanacaktır. Yerel bir organizasyon bulacağız - ancak iyi bir organizasyon biliyorsanız bize bildirin: info@grbt.studio"
        },
        designOrigin: "Peri Bacaları ve Kapadokya manzarası",
        cityInfo: {
            general: "Nevşehir, Kapadokya bölgesinin kalbinde yer alan büyülü bir şehirdir. Peri bacaları ve yeraltı şehirleriyle ünlü olan şehir, doğal harikalar ve tarihi dokularla ziyaretçilerini büyüler. UNESCO Dünya Mirası listesinde yer alan Kapadokya'nın merkezidir.",
            culture: "Nevşehir halkı, turizm sektöründeki deneyimi ve doğal miraslarına sahip çıkma bilinciyle tanınır. Şehrin kültürel yaşamı, geleneksel el sanatları ve modern turizm hizmetlerinin harmanlanmasıyla şekillenmiştir. Peri bacalarının büyüsü şehrin sosyal yaşamına da yansır."
        }
    },
    sivas: {
        description: "Sivas'ın Anadolu'nun kültür başkenti olan zengin tarihini taşıyan tasarım. Selçuklu mimarisi ve geleneksel el sanatları.",
        donation: {
            percentage: 5,
            organization: "Bu tişörtten elde edilen kârın %5'i Sivas'taki bir hayvan bakım organizasyonuna bağışlanacaktır. Yerel bir organizasyon bulacağız - ancak iyi bir organizasyon biliyorsanız bize bildirin: info@grbt.studio"
        },
        designOrigin: "Sivas Kalesi ve Çifte Minareli Medrese",
        cityInfo: {
            general: "Sivas, İç Anadolu'nun kültür başkenti olarak bilinen tarihi bir şehirdir. Selçuklu mimarisinin en güzel örneklerini barındıran şehir, Çifte Minareli Medrese ve tarihi kalesiyle tanınır. Şehir, geleneksel el sanatları ve kültürel mirasıyla ünlüdür.",
            culture: "Sivas halkı, kültürel değerlere bağlılığı ve geleneksel el sanatlarına olan ilgisiyle bilinir. Şehrin kültürel yaşamı, Selçuklu mirası ve modern yaşamın uyumlu birleşimiyle şekillenmiştir. Geleneksel müzik ve folklor kültürü hala yaşatılmaktadır."
        }
    },
    trabzon: {
        description: "Trabzon'un Karadeniz'in incisi olan yeşil doğasını yansıtan tasarım. Uzungöl ve geleneksel Karadeniz kültürü.",
        donation: {
            percentage: 5,
            organization: "Bu tişörtten elde edilen kârın %5'i Trabzon'daki bir hayvan bakım organizasyonuna bağışlanacaktır. Yerel bir organizasyon bulacağız - ancak iyi bir organizasyon biliyorsanız bize bildirin: info@grbt.studio"
        },
        designOrigin: "Uzungöl ve Trabzon Kalesi",
        cityInfo: {
            general: "Trabzon, Karadeniz'in incisi olarak bilinen yeşil doğasıyla ünlü bir şehirdir. Uzungöl ve tarihi Trabzon Kalesi ile tanınan şehir, doğal güzellikleri ve geleneksel Karadeniz kültürüyle ziyaretçilerini büyüler. Şehir, deniz ve dağ manzarasının muhteşem birleşimini sunar.",
            culture: "Trabzon halkı, Karadeniz'in karakteristik özelliklerini taşır. Şehrin kültürel yaşamı, geleneksel horon dansları ve yerel müzik kültürüyle şekillenmiştir. Misafirperverliği ve doğal yaşamla uyumuyla tanınır."
        }
    },
    yozgat: {
        description: "Yozgat'ın tarihi dokusu ve geleneksel mimarisini yansıtan tasarım. İç Anadolu'nun kültürel zenginliği.",
        donation: {
            percentage: 5,
            organization: "Bu tişörtten elde edilen kârın %5'i Yozgat'taki bir hayvan bakım organizasyonuna bağışlanacaktır. Yerel bir organizasyon bulacağız - ancak iyi bir organizasyon biliyorsanız bize bildirin: info@grbt.studio"
        },
        designOrigin: "Yozgat Kalesi ve geleneksel mimari",
        cityInfo: {
            general: "Yozgat, İç Anadolu Bölgesi'nin önemli şehirlerinden biridir. Tarihi dokusu ve geleneksel mimarisiyle tanınan şehir, tarım ve hayvancılık sektörlerinde önemli bir yere sahiptir. Şehir, kültürel mirası ve doğal güzellikleriyle ziyaretçilerini etkiler.",
            culture: "Yozgat halkı, geleneksel değerlere bağlılığı ve misafirperverliği ile bilinir. Şehrin kültürel yaşamı, yerel festivaller ve geleneksel el sanatlarıyla şekillenmiştir. Tarım ve hayvancılık kültürü şehrin sosyal dokusunu oluşturur."
        }
    },
    ankara: {
        description: "Ankara'nın modern başkent kimliği ile tarihi dokusunu birleştiren tasarım. Atatürk'ün şehri ve Türkiye'nin kalbi.",
        donation: {
            percentage: 5,
            organization: "Bu tişörtten elde edilen kârın %5'i Ankara'daki bir hayvan bakım organizasyonuna bağışlanacaktır. Yerel bir organizasyon bulacağız - ancak iyi bir organizasyon biliyorsanız bize bildirin: info@grbt.studio"
        },
        designOrigin: "Anıtkabir ve Ankara Kalesi",
        cityInfo: {
            general: "Ankara, Türkiye'nin başkenti ve en büyük ikinci şehridir. Modern yapısıyla tarihi dokusunu harmanlayan şehir, siyasi merkez olmasının yanı sıra kültürel ve sosyal yaşamın da kalbidir. Anıtkabir, Ankara Kalesi ve modern mimarisiyle tanınır.",
            culture: "Ankara halkı, çeşitli kültürlerden gelen insanların oluşturduğu dinamik bir toplumdur. Şehir, modern yaşam tarzı ile geleneksel değerlerin buluştuğu bir merkezdir. Eğitim, sanat ve kültür alanlarında önemli bir rol oynar."
        }
    },
    aydin: {
        description: "Aydın'ın Ege'nin bereketli topraklarını ve antik tarihini yansıtan tasarım. Zeytin ve incir diyarı.",
        donation: {
            percentage: 5,
            organization: "Bu tişörtten elde edilen kârın %5'i Aydın'daki bir hayvan bakım organizasyonuna bağışlanacaktır. Yerel bir organizasyon bulacağız - ancak iyi bir organizasyon biliyorsanız bize bildirin: info@grbt.studio"
        },
        designOrigin: "Efes Antik Kenti ve Ege doğası",
        cityInfo: {
            general: "Aydın, Ege Bölgesi'nin bereketli topraklarında yer alan tarihi bir şehirdir. Antik Efes kenti ve zengin tarım alanlarıyla tanınan şehir, turizm ve tarım sektörlerinde önemli bir yere sahiptir. Ege'nin sıcak iklimi ve doğal güzellikleri şehri çekici kılar.",
            culture: "Aydın halkı, Ege'nin sıcakkanlı ve misafirperver karakterini taşır. Şehrin kültürel yaşamı, antik tarih mirası ve modern yaşam tarzının harmanlanmasıyla şekillenmiştir. Zeytin, incir ve üzüm kültürü şehrin sosyal dokusunu oluşturur."
        }
    },
    gumushane: {
        description: "Gümüşhane'nin dağlık doğasını ve tarihi gümüş madenlerini yansıtan tasarım. Karadeniz'in yükseklerindeki gizli hazine.",
        donation: {
            percentage: 5,
            organization: "Bu tişörtten elde edilen kârın %5'i Gümüşhane'deki bir hayvan bakım organizasyonuna bağışlanacaktır. Yerel bir organizasyon bulacağız - ancak iyi bir organizasyon biliyorsanız bize bildirin: info@grbt.studio"
        },
        designOrigin: "Gümüş madenleri ve dağlık doğa",
        cityInfo: {
            general: "Gümüşhane, Karadeniz Bölgesi'nin dağlık kesiminde yer alan tarihi bir şehirdir. Tarihi gümüş madenleri ve doğal güzellikleriyle tanınan şehir, yüksek rakımlı konumuyla benzersiz bir coğrafyaya sahiptir. Şehir, maden tarihi ve doğal zenginlikleriyle ziyaretçilerini etkiler.",
            culture: "Gümüşhane halkı, dağlık yaşamın zorluklarına alışkın, dayanıklı ve çalışkan bir toplumdur. Şehrin kültürel yaşamı, maden işçiliği geleneği ve doğal yaşamla uyum içinde şekillenmiştir. Geleneksel el sanatları ve yerel müzik kültürü önemli yer tutar."
        }
    },
    nigde: {
        description: "Niğde'nin Kapadokya'nın eşsiz doğasını ve tarihi dokusunu yansıtan tasarım. Peri bacaları ve antik tarih.",
        donation: {
            percentage: 5,
            organization: "Bu tişörtten elde edilen kârın %5'i Niğde'deki bir hayvan bakım organizasyonuna bağışlanacaktır. Yerel bir organizasyon bulacağız - ancak iyi bir organizasyon biliyorsanız bize bildirin: info@grbt.studio"
        },
        designOrigin: "Kapadokya peri bacaları ve Niğde Kalesi",
        cityInfo: {
            general: "Niğde, Kapadokya bölgesinin önemli şehirlerinden biridir. Peri bacaları ve antik tarihiyle ünlü olan şehir, turizm ve tarım sektörlerinde önemli bir yere sahiptir. Kapadokya'nın eşsiz doğal oluşumları ve tarihi dokusu şehri çekici kılar.",
            culture: "Niğde halkı, Kapadokya'nın tarihi mirasına sahip çıkan, kültürel değerlere bağlı bir toplumdur. Şehrin kültürel yaşamı, antik tarih mirası ve modern yaşam tarzının harmanlanmasıyla şekillenmiştir. Turizm kültürü ve geleneksel el sanatları önemli yer tutar."
        }
    },
    rize: {
        description: "Rize'nin çay bahçelerini ve Karadeniz'in yeşil doğasını yansıtan tasarım. Çayın anavatanı ve doğal güzellikler.",
        donation: {
            percentage: 5,
            organization: "Bu tişörtten elde edilen kârın %5'i Rize'deki bir hayvan bakım organizasyonuna bağışlanacaktır. Yerel bir organizasyon bulacağız - ancak iyi bir organizasyon biliyorsanız bize bildirin: info@grbt.studio"
        },
        designOrigin: "Çay bahçeleri ve Karadeniz doğası",
        cityInfo: {
            general: "Rize, Karadeniz Bölgesi'nin çay üretim merkezi olarak bilinen yeşil doğasıyla ünlü bir şehirdir. Çay bahçeleri ve dağlık coğrafyasıyla tanınan şehir, tarım ve turizm sektörlerinde önemli bir yere sahiptir. Karadeniz'in nemli iklimi ve bereketli toprakları şehri çekici kılar.",
            culture: "Rize halkı, çay kültürü ve Karadeniz'in karakteristik özelliklerini taşır. Şehrin kültürel yaşamı, çay üretimi geleneği ve doğal yaşamla uyum içinde şekillenmiştir. Geleneksel horon dansları ve yerel müzik kültürü önemli yer tutar."
        }
    },
    corum: {
        description: "Çorum'un Hitit medeniyetinin kalbi olan tarihi dokusunu yansıtan tasarım. Antik tarih ve geleneksel kültür.",
        donation: {
            percentage: 5,
            organization: "Bu tişörtten elde edilen kârın %5'i Çorum'daki bir hayvan bakım organizasyonuna bağışlanacaktır. Yerel bir organizasyon bulacağız - ancak iyi bir organizasyon biliyorsanız bize bildirin: info@grbt.studio"
        },
        designOrigin: "Hattuşaş ve Hitit medeniyeti",
        cityInfo: {
            general: "Çorum, Hitit medeniyetinin başkenti Hattuşaş'ın bulunduğu tarihi bir şehirdir. Antik tarih ve arkeolojik zenginlikleriyle tanınan şehir, UNESCO Dünya Mirası listesinde yer alan önemli bir kültürel merkezdir. Şehir, Hitit medeniyetinin izlerini taşıyan tarihi dokusuyla ziyaretçilerini büyüler.",
            culture: "Çorum halkı, tarihi mirasa sahip çıkan ve kültürel değerlere bağlı bir toplumdur. Şehrin kültürel yaşamı, Hitit medeniyetinin izleri ve modern yaşamın harmanlanmasıyla şekillenmiştir. Arkeolojik turizm ve geleneksel el sanatları önemli yer tutar."
        }
    },
    usak: {
        description: "Uşak'ın Ege'nin iç kesimlerindeki sakin atmosferini yansıtan tasarım. Geleneksel halı dokumacılığı ve doğal güzellikler.",
        donation: {
            percentage: 5,
            organization: "Bu tişörtten elde edilen kârın %5'i Uşak'taki bir hayvan bakım organizasyonuna bağışlanacaktır. Yerel bir organizasyon bulacağız - ancak iyi bir organizasyon biliyorsanız bize bildirin: info@grbt.studio"
        },
        designOrigin: "Uşak halıları ve geleneksel dokumacılık",
        cityInfo: {
            general: "Uşak, Ege Bölgesi'nin iç kesimlerinde yer alan ve geleneksel halı dokumacılığıyla ünlü bir şehirdir. Uşak halıları dünya çapında tanınan el sanatı ürünleridir. Şehir, doğal güzellikleri ve geleneksel kültürüyle ziyaretçilerini etkiler.",
            culture: "Uşak halkı, geleneksel el sanatlarına olan ilgisi ve halı dokumacılığındaki ustalığıyla bilinir. Şehrin kültürel yaşamı, geleneksel dokumacılık kültürü ve modern yaşamın uyumlu birleşimiyle şekillenmiştir. El sanatları ve yerel müzik kültürü önemli yer tutar."
        }
    },
    kirsehir: {
        description: "Kırşehir'in Ahi Evran'ın şehri olan tasavvuf kültürünü yansıtan tasarım. Ahilik geleneği ve manevi değerler.",
        donation: {
            percentage: 5,
            organization: "Bu tişörtten elde edilen kârın %5'i Kırşehir'deki bir hayvan bakım organizasyonuna bağışlanacaktır. Yerel bir organizasyon bulacağız - ancak iyi bir organizasyon biliyorsanız bize bildirin: info@grbt.studio"
        },
        designOrigin: "Ahi Evran ve Ahilik geleneği",
        cityInfo: {
            general: "Kırşehir, Ahi Evran'ın şehri olarak bilinen ve Ahilik geleneğinin merkezi olan tarihi bir şehirdir. Tasavvuf kültürü ve manevi değerlerle tanınan şehir, geleneksel Türk kültürünün önemli merkezlerinden biridir. Şehir, manevi atmosferi ve kültürel mirasıyla ziyaretçilerini etkiler.",
            culture: "Kırşehir halkı, tasavvuf kültürüne olan bağlılığı ve manevi değerlere saygısıyla bilinir. Şehrin kültürel yaşamı, Ahilik geleneği ve modern yaşamın harmanlanmasıyla şekillenmiştir. Geleneksel müzik ve folklor kültürü hala yaşatılmaktadır."
        }
    },
    sakarya: {
        description: "Sakarya'nın Marmara'nın bereketli topraklarını ve doğal güzelliklerini yansıtan tasarım. Sapanca Gölü ve yeşil doğa.",
        donation: {
            percentage: 5,
            organization: "Bu tişörtten elde edilen kârın %5'i Sakarya'daki bir hayvan bakım organizasyonuna bağışlanacaktır. Yerel bir organizasyon bulacağız - ancak iyi bir organizasyon biliyorsanız bize bildirin: info@grbt.studio"
        },
        designOrigin: "Sapanca Gölü ve Sakarya Nehri",
        cityInfo: {
            general: "Sakarya, Marmara Bölgesi'nin doğal güzellikleriyle ünlü şehirlerinden biridir. Sapanca Gölü ve Sakarya Nehri ile tanınan şehir, tarım ve sanayi sektörlerinde önemli bir yere sahiptir. Şehir, doğal güzellikleri ve modern yaşam tarzının harmanlanmasıyla çekici kılar.",
            culture: "Sakarya halkı, doğal yaşamla uyumu ve modern yaşam tarzını benimsemesiyle bilinir. Şehrin kültürel yaşamı, doğal güzellikler ve şehir yaşamının uyumlu birleşimiyle şekillenmiştir. Su sporları ve doğa turizmi kültürü önemli yer tutar."
        }
    },
    agri: {
        description: "Ağrı'nın Türkiye'nin en yüksek dağı olan Ağrı Dağı'nın görkemini yansıtan tasarım. Doğu Anadolu'nun doğal güzellikleri.",
        donation: {
            percentage: 5,
            organization: "Bu tişörtten elde edilen kârın %5'i Ağrı'daki bir hayvan bakım organizasyonuna bağışlanacaktır. Yerel bir organizasyon bulacağız - ancak iyi bir organizasyon biliyorsanız bize bildirin: info@grbt.studio"
        },
        designOrigin: "Ağrı Dağı ve Doğu Anadolu doğası",
        cityInfo: {
            general: "Ağrı, Türkiye'nin en yüksek dağı olan Ağrı Dağı'nın eteklerinde kurulmuş olan ve doğal güzellikleriyle ünlü bir şehirdir. Doğu Anadolu'nun karakteristik özelliklerini taşıyan şehir, dağcılık ve doğa sporları için önemli bir merkezdir. Şehir, görkemli doğal manzarasıyla ziyaretçilerini büyüler.",
            culture: "Ağrı halkı, dağlık yaşamın zorluklarına alışkın, dayanıklı ve çalışkan bir toplumdur. Şehrin kültürel yaşamı, doğal yaşamla uyum içinde şekillenmiştir. Dağcılık kültürü ve geleneksel el sanatları önemli yer tutar."
        }
    },
    // Hasret Collection
    "gurbetten-memlekete": {
        description: "Gurbetteki Türklerin memleket özlemini yansıtan tasarım. Uzak diyarlarda yaşayanların kalbindeki sıla hasreti.",
        donation: {
            percentage: 5,
            organization: "Gurbetçi Hayvan Dostları",
            link: "https://gurbetcihayvandostlari.org"
        },
        designOrigin: "Gurbetçi kültürü ve memleket bağları"
    },
    "sıla-yolu": {
        description: "Sıla yolunun uzunluğunu ve gurbetçilerin eve dönüş özlemini taşıyan tasarım. Her kilometrede bir hatıra.",
        donation: {
            percentage: 5,
            organization: "Sıla Yolu Hayvan Barınağı",
            link: "https://silayoluhayvanbarinagi.org"
        },
        designOrigin: "Gurbet yolları ve memleket özlemi"
    },
    "yabanci": {
        description: "Yabancı diyarlarda yaşayan Türklerin kimlik mücadelesini ve kültürel aidiyetini yansıtan tasarım.",
        donation: {
            percentage: 5,
            organization: "Yabancı Diyarlar Hayvan Koruma",
            link: "https://yabancihayvankoruma.org"
        },
        designOrigin: "Kültürel kimlik ve aidiyet duygusu"
    }
};

export function getProductBySlug(slug: string): Product | undefined {
    // Decode URL-encoded slug
    const decodedSlug = decodeURIComponent(slug);
    if (!memleketSlugs.includes(decodedSlug) && !hasretSlugs.includes(decodedSlug)) return undefined;
    const city = titleCaseCity(decodedSlug);
    const image = getPrimaryImageForSlug(decodedSlug);
    const images = getImagesForSlug(decodedSlug);
    const data = productData[decodedSlug];

    return {
        slug: decodedSlug,
        city,
        image,
        images,
        colors: getAvailableColors(),
        sizes: ["S", "M", "L", "XL", "XXL"],
        description: data.description,
        donation: data.donation,
        designOrigin: data.designOrigin,
        cityInfo: data.cityInfo,
    };
}


