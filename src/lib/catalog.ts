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
    "aksaray",
    "ardahan",
    "gaziantep",
    "karaman",
    "kayseri",
    "konya",
    "nevsehir",
    "sivas",
    "trabzon",
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
        "aksaray": "Aksaray",
        "ardahan": "Ardahan",
        "gaziantep": "Gaziantep",
        "karaman": "Karaman",
        "kayseri": "Kayseri",
        "konya": "Konya",
        "nevsehir": "Nevşehir",
        "sivas": "Sivas",
        "trabzon": "Trabzon",
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

export function getImagesForSlug(slug: string, color: string = "siyah"): string[] {
    // Determine collection based on slug
    const collection = hasretSlugs.includes(slug) ? "hasret" : "memleket";
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
            organization: "Bu tişörtten elde edilen kârın %5'i Afyon'daki bir hayvan bakım organizasyonuna bağışlanacaktır. Yerel bir organizasyon bulacağız - ancak iyi bir organizasyon biliyorsanız bize bildirin: info@grbt.com"
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
            organization: "Bu tişörtten elde edilen kârın %5'i Aksaray'daki bir hayvan bakım organizasyonuna bağışlanacaktır. Yerel bir organizasyon bulacağız - ancak iyi bir organizasyon biliyorsanız bize bildirin: info@grbt.com"
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
            organization: "Bu tişörtten elde edilen kârın %5'i Ardahan'daki bir hayvan bakım organizasyonuna bağışlanacaktır. Yerel bir organizasyon bulacağız - ancak iyi bir organizasyon biliyorsanız bize bildirin: info@grbt.com"
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
            organization: "Bu tişörtten elde edilen kârın %5'i Gaziantep'teki bir hayvan bakım organizasyonuna bağışlanacaktır. Yerel bir organizasyon bulacağız - ancak iyi bir organizasyon biliyorsanız bize bildirin: info@grbt.com"
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
            organization: "Bu tişörtten elde edilen kârın %5'i Karaman'daki bir hayvan bakım organizasyonuna bağışlanacaktır. Yerel bir organizasyon bulacağız - ancak iyi bir organizasyon biliyorsanız bize bildirin: info@grbt.com"
        },
        designOrigin: "Karaman Kalesi ve Yunus Emre Türbesi",
        cityInfo: {
            general: "Karaman, İç Anadolu Bölgesi'nde yer alan ve Türk kültürünün önemli merkezlerinden biridir. Yunus Emre'nin şehri olarak bilinen Karaman, tasavvuf kültürü ve geleneksel Türk değerleriyle tanınır. Şehir, tarihi dokusu ve kültürel mirasıyla ziyaretçilerini büyüler.",
            culture: "Karaman halkı, geleneksel Türk kültürüne bağlılığı ve dini değerlere saygısıyla bilinir. Şehrin kültürel yaşamı, tasavvuf geleneği ve modern yaşamın harmanlanmasıyla şekillenmiştir. Yunus Emre'nin felsefesi hala şehrin sosyal dokusunda yaşatılmaktadır."
        }
    },
    yozgat: {
        description: "Yozgat'ın iç Anadolu'nun kalbi olan sakin atmosferini taşıyan tasarım. Geleneksel mimari ve doğal güzellikler.",
        donation: {
            percentage: 5,
            organization: "Bu tişörtten elde edilen kârın %5'i Yozgat'taki bir hayvan bakım organizasyonuna bağışlanacaktır. Yerel bir organizasyon bulacağız - ancak iyi bir organizasyon biliyorsanız bize bildirin: info@grbt.com"
        },
        designOrigin: "Yozgat Çamlığı ve tarihi evler",
        cityInfo: {
            general: "Yozgat, İç Anadolu Bölgesi'nin kalbinde yer alan sakin ve huzurlu bir şehirdir. Çamlık Milli Parkı ve tarihi evleriyle tanınan şehir, doğal güzellikleri ve geleneksel mimarisiyle ziyaretçilerini büyüler. Şehir, tarım ve hayvancılık sektörlerinde önemli bir yere sahiptir.",
            culture: "Yozgat halkı, sakin ve huzurlu yaşam tarzıyla bilinir. Şehrin kültürel dokusu, geleneksel değerler ve modern yaşamın uyumlu birleşimiyle şekillenmiştir. Misafirperverliği ve doğal yaşamla uyumuyla tanınır."
        }
    },
    kayseri: {
        description: "Kayseri'nin ticaret merkezi olan dinamik atmosferini yansıtan tasarım. Erciyes Dağı ve geleneksel ticaret kültürü.",
        donation: {
            percentage: 5,
            organization: "Bu tişörtten elde edilen kârın %5'i Kayseri'deki bir hayvan bakım organizasyonuna bağışlanacaktır. Yerel bir organizasyon bulacağız - ancak iyi bir organizasyon biliyorsanız bize bildirin: info@grbt.com"
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
            organization: "Bu tişörtten elde edilen kârın %5'i Konya'daki bir hayvan bakım organizasyonuna bağışlanacaktır. Yerel bir organizasyon bulacağız - ancak iyi bir organizasyon biliyorsanız bize bildirin: info@grbt.com"
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
            organization: "Bu tişörtten elde edilen kârın %5'i Nevşehir'deki bir hayvan bakım organizasyonuna bağışlanacaktır. Yerel bir organizasyon bulacağız - ancak iyi bir organizasyon biliyorsanız bize bildirin: info@grbt.com"
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
            organization: "Bu tişörtten elde edilen kârın %5'i Sivas'taki bir hayvan bakım organizasyonuna bağışlanacaktır. Yerel bir organizasyon bulacağız - ancak iyi bir organizasyon biliyorsanız bize bildirin: info@grbt.com"
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
            organization: "Bu tişörtten elde edilen kârın %5'i Trabzon'daki bir hayvan bakım organizasyonuna bağışlanacaktır. Yerel bir organizasyon bulacağız - ancak iyi bir organizasyon biliyorsanız bize bildirin: info@grbt.com"
        },
        designOrigin: "Uzungöl ve Trabzon Kalesi",
        cityInfo: {
            general: "Trabzon, Karadeniz'in incisi olarak bilinen yeşil doğasıyla ünlü bir şehirdir. Uzungöl ve tarihi Trabzon Kalesi ile tanınan şehir, doğal güzellikleri ve geleneksel Karadeniz kültürüyle ziyaretçilerini büyüler. Şehir, deniz ve dağ manzarasının muhteşem birleşimini sunar.",
            culture: "Trabzon halkı, Karadeniz'in karakteristik özelliklerini taşır. Şehrin kültürel yaşamı, geleneksel horon dansları ve yerel müzik kültürüyle şekillenmiştir. Misafirperverliği ve doğal yaşamla uyumuyla tanınır."
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
        sizes: ["S", "M", "L", "XL"],
        description: data.description,
        donation: data.donation,
        designOrigin: data.designOrigin,
        cityInfo: data.cityInfo,
    };
}


