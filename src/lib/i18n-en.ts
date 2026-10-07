/**
 * Spanish -> English.
 *
 * The site is Spanish; this is what the EN toggle swaps in. Keys are the
 * Spanish strings exactly as the components render them, so a key that drifts
 * falls back to its own text, which is Spanish — the site stays correct for the
 * audience it is for, and only the toggle degrades.
 *
 * `npm run i18n:check` lists any key the source uses and this file lacks.
 */
export const EN: Record<string, string> = {
  /* ------------------------------------------------------------- navigation */
  Experiencias: "Experiences",
  "Por qué funciona": "Why it works",
  Ejemplos: "Examples",
  Empezar: "Get started",
  Precios: "Pricing",
  "Crea tu experiencia": "Create my experience",

  /* ------------------------------------------------------------------- hero */
  "Para marcas de moda en Shopify": "For fashion brands on Shopify",
  "No enseñes": "Don't just show",
  "tu ropa.": "your clothes.",
  "Deja que se la prueben.": "Let people wear them.",
  "Convierte tu catálogo de Shopify en una experiencia de moda con IA donde cualquiera puede probarse tu ropa, crear looks, hacerse fotos y vídeos, hablar con tu anfitrión, y comprar después en tu tienda de siempre.":
    "Turn your Shopify catalogue into an interactive AI fashion experience where shoppers try on your clothes, build looks, make photos and videos, meet your host — and then buy from the store you already have.",
  "Ver un ejemplo real": "See a real example",
  "Desde 200 € al mes · Sin tocar tu Shopify": "From €200/month · No Shopify rebuild required",
  "Probador virtual": "Virtual try-on",
  "Completa tu look": "Complete my look",
  "Escenas con IA": "AI scenes",
  "Fotos con tu anfitrión": "Photos with your host",
  "Looks animados": "Animated looks",
  "Contenido para compartir": "Shareable content",
  "Checkout en Shopify": "Shopify checkout",

  /* ------------------------------------------------------------- core idea */
  "Tu tienda de Shopify vende ropa.": "Your Shopify store sells clothes.",
  "Nosotros la convertimos en": "We turn it into",
  experiencias: "experiences",
  Antes: "Before",
  Después: "After",
  "Foto de catálogo": "Catalogue product photo",
  "Foto del producto": "Product image",
  Precio: "Price",
  Talla: "Size",
  "Añadir al carrito": "Add to cart",
  "Cliente dentro de una escena generada con IA": "Shopper placed inside an AI-generated scene",
  Verla: "See it",
  Ponértela: "Wear it",
  Combinarla: "Style it",
  "Crear con ella": "Create with it",
  Compartirla: "Share it",
  Comprarla: "Buy it",
  "El ecommerce de siempre le pide al cliente que se imagine con tu ropa.":
    "Traditional ecommerce asks customers to imagine themselves in your clothes.",
  "La IA deja que se vea de verdad.": "AI lets them actually see it.",

  /* ---------------------------------------------------------- experiences */
  "La capa de experiencia": "The experience layer",
  "Un producto.": "One product.",
  "Seis experiencias.": "Six experiences.",
  EXPERIENCIA: "EXPERIENCE",
  Pruébatelo: "Try it on",
  "Sube una foto.": "Upload a photo.",
  "Elige una prenda.": "Choose a product.",
  "Mírate con ella puesta.": "See yourself wearing it.",
  "Probar esta experiencia →": "Try this experience →",
  "Foto del cliente antes del probador": "Shopper photo before try-on",
  "El cliente con la prenda puesta": "Shopper wearing the garment",
  Reiniciar: "Reset",
  "Probar con IA": "Run AI try-on",
  "No te quedes en una prenda.": "Don't stop at one garment.",
  "Deja que la IA combine prendas de la tienda en looks completos.":
    "Let AI combine products from the store into complete outfits.",
  "Crear un look →": "Create a look →",
  Pantalón: "Trousers",
  Chaqueta: "Jacket",
  Zapatos: "Shoes",
  "Tu look": "Your look",
  "Prenda del look": "Outfit component",
  "Entra en la marca": "Step into the brand",
  "No solo lleves la ropa.": "Don't just wear the clothing.",
  "Entra en el mundo de la marca.": "Enter the world of the brand.",
  "Crear mi escena →": "Create my scene →",
  "Club de playa": "Beach Club",
  "Campo de golf": "Golf Course",
  Ciudad: "City",
  "Hotel de lujo": "Luxury Hotel",
  "Estación de esquí": "Ski Resort",
  "Ponme en": "Put me in",
  "la IA genera al cliente allí, con la ropa que ha elegido.":
    "AI generates the shopper there, in the clothes they chose.",
  "Escena generada con IA": "AI-generated scene",
  "Conoce a tu embajador": "Meet your influencer",
  "Tu embajador ya no está solo en la campaña.":
    "Your influencer isn't just in the campaign any more.",
  "El cliente puede salir con él.": "The customer can join them.",
  "Crear con un embajador →": "Create with an influencer →",
  "Cliente y embajador juntos en una foto con IA":
    "Customer and ambassador together in an AI photo",
  Cliente: "Customer",
  Embajador: "Influencer",
  "Tu ropa": "Your clothes",
  "Foto con IA": "AI photo",
  "En la playa con nuestro embajador": "At the beach with our ambassador",
  "En una fiesta": "At a party",
  "Jugando al golf": "Playing golf",
  "Paseando por Madrid": "Walking through Madrid",
  "En primera fila en la Fashion Week": "Front row at Fashion Week",
  "Las experiencias con embajadores requieren los derechos de imagen y los permisos correspondientes.":
    "Influencer and ambassador experiences require the appropriate image rights and permissions.",
  "Dale vida": "Bring it to life",
  "Convierte la foto generada en vídeo.": "Turn the generated image into video.",
  "La persona camina. La cámara se mueve. La ropa se mueve de verdad.":
    "The person walks. The camera moves. The clothes move naturally.",
  "Look listo para animar": "Generated look ready to animate",
  Animar: "Animate",
  "Animar mi look": "Animate my look",
  "Crear vídeo": "Create video",
  Compartir: "Share",
  "Comparte tu look": "Share your look",
  "Cada cliente puede ser creador.": "Every customer can become a creator.",
  "Cada look que cree puede ser contenido que traiga a otro cliente a tu marca.":
    "Every look they create can become content that brings another customer to your brand.",
  "Copiar enlace": "Copy link",

  /* -------------------------------------------------------- shop the look */
  "Look generado con prendas comprables": "Generated look with shoppable hotspots",
  "Polo marino": "Navy polo",
  "Pantalón blanco": "White trousers",
  "Compra desde la experiencia": "Shop the experience",
  "No sustituimos tu tienda.": "We don't replace your store.",
  "Te mandamos clientes que ya quieren la prenda.":
    "We send shoppers to it already wanting the product.",
  Experiencia: "Experience",
  Producto: "Product",
  "Comprar este look": "Buy this look",
  "Al pulsar un look se abre la prenda en tu tienda de Shopify, con tus parámetros de seguimiento.":
    "Clicking a look opens the matching product on your Shopify store, with your tracking parameters attached.",

  /* ---------------------------------------------------------------- proof */
  "Por qué importa": "Why this matters",
  "Atención antes que transacción.": "Attention before transaction.",
  "Más visitas de calidad según Google para las imágenes de probador virtual, frente al resto de imágenes de compra.":
    "More high-quality views reported by Google for virtual try-on imagery compared with other shopping images.",
  "Fuente: anuncio del probador virtual de Google Shopping":
    "Source: Google Shopping virtual try-on announcement",
  "Más probabilidad de compra entre los clientes de Rebecca Minkoff que vieron un producto en realidad aumentada, según Shopify.":
    "Rebecca Minkoff shoppers who viewed a product in AR were reported by Shopify as more likely to purchase.",
  "Fuente: caso de estudio de comercio AR de Shopify": "Source: Shopify AR commerce case study",
  "de los compradores de moda online encuestados por Google e Ipsos dijeron haber devuelto una prenda porque les quedaba distinta de lo que esperaban.":
    "of online apparel shoppers surveyed by Google and Ipsos said they had returned an item because it looked different on them than expected.",
  "Fuente: encuesta de Google e Ipsos a compradores de moda":
    "Source: Google / Ipsos apparel shopper survey",
  "El probador virtual y el comercio inmersivo pueden aumentar la interacción y la confianza al comprar. Las cifras de arriba son datos públicos de terceros: no son resultados nuestros ni una promesa de lo que vaya a pasar en tu tienda.":
    "Virtual try-on and immersive commerce can increase engagement and buying confidence. The figures above are external industry evidence published by third parties — they are not our results and are not a promise of performance for your store.",
  "El bucle de interacción": "The engagement loop",
  "Convierte comprar en jugar.": "Turn shopping into play.",
  "Cuanto más tiempo pasa un cliente con tus productos, más ocasiones tiene tu marca de crear deseo, leer su intención y acabar en una compra.":
    "The longer customers interact with your products, the more chances your brand has to create desire, read intent and earn a purchase.",
  "Tu marca": "Your brand",
  Ver: "See",
  Probar: "Try",
  Crear: "Create",
  Comprar: "Buy",
  Volver: "Return",
  "Fotografía editorial del embajador de la marca": "Brand ambassador editorial photograph",
  "Comercio con embajadores": "Influencer commerce",
  "¿Ya trabajas con un embajador?": "Already working with an influencer?",
  "Hazle parte de la experiencia de tienda.": "Make them part of the store experience.",
  "En vez de que el cliente solo vea al embajador con tus prendas, deja que cree experiencias con él.":
    "Instead of customers simply seeing an influencer wearing your products, let them create experiences with them.",
  "El embajador lleva la prenda": "Influencer wears product",
  "El cliente se la prueba": "Customer tries product",
  "El cliente se hace una foto con el embajador": "Customer creates a photo with the influencer",
  "El cliente comparte la foto": "Customer shares the photo",
  "Un amigo abre la experiencia": "Friend opens the experience",
  "Cliente nuevo": "New customer",
  "Las experiencias con una persona concreta requieren los derechos de imagen correspondientes. La marca es responsable de conseguir el permiso por escrito antes de enviarnos material de un embajador.":
    "Experiences featuring a named person require the appropriate image and likeness rights. The brand is responsible for obtaining written permission before sending us influencer or ambassador material.",

  /* ------------------------------------------------------------- examples */
  "Hecho, en marcha, se puede abrir": "Built, live, and clickable",
  "Dos marcas ya la tienen.": "Two brands already have one.",
  "No son maquetas. Son dos experiencias en producción, con el catálogo real de cada marca. Ábrelas y pruébatelas tú.":
    "These aren't mockups. They are two experiences in production, running on each brand's real catalogue. Open them and try them yourself.",
  "La experiencia de": "The experience for",
  "En directo": "Live",
  "Moda masculina española": "Spanish menswear",
  "Polos, camisas y punto. El visitante se prueba la ropa, se hace una foto con Bertín, y compra en la tienda de siempre.":
    "Polos, shirts and knitwear. Visitors try the clothes on, take a photo with Bertín, and buy from the store they already had.",
  "Lino y algodón para el verano": "Linen and cotton for the summer",
  "La segunda marca. Mismo motor, otra marca, otro anfitrión, otro mundo. Nada se escribió a mano dos veces.":
    "The second brand. Same engine, different brand, different host, different world. Nothing was written by hand twice.",
  "Prendas en el probador": "Garments in the try-on",
  "Pestañas de categoría": "Category tabs",
  "Construida en": "Built in",
  Semanas: "Weeks",
  Días: "Days",
  "Abrir la experiencia": "Open the experience",
  "La primera llevó semanas y se hizo a mano. La segunda, días. La tuya se construye sola en unos diez minutos, porque lo que antes hacíamos a mano ahora lo hace la máquina.":
    "The first took weeks and was made by hand. The second took days. Yours builds itself in about ten minutes, because what we used to do by hand the machine now does.",

  /* --------------------------------------------------------- three things */
  "Lo que necesitamos de la marca": "What we need from the brand",
  "Tres cosas.": "Three things.",
  "La dirección de tu tienda": "Your shop's address",
  "Y ya está el catálogo. Leemos tu feed público de Shopify en directo cada vez: productos, fotos y precios. Nada que subir, nada que mantener sincronizado.":
    "That's the whole catalogue step. We read your public Shopify feed live, every time: products, photos and prices. Nothing to upload, nothing to keep in sync.",
  "No guardamos nada": "We store none of it",
  "Tus imágenes se quedan en tu CDN. Guardamos direcciones, no ficheros.":
    "Your images stay on your CDN. We hold addresses, not files.",
  "Un nombre y una letra para el símbolo. Los colores y la tipografía los sacamos de tu propia web, para que la experiencia se parezca a ti y no a nosotros.":
    "A name and a letter for the mark. Colours and type we read off your own storefront, so the experience looks like you and not like us.",
  "Nombre de la marca": "Brand name",
  Obligatorio: "Required",
  Monograma: "Monogram",
  "Lo proponemos": "We propose one",
  Colores: "Colours",
  Tipografía: "Type",
  "De tu web": "From your site",
  Idioma: "Language",
  "Español o inglés": "Spanish or English",
  "Tu anfitrión y tu mundo": "Your host and your world",
  "Una línea sobre qué haces y dónde se lleva, y quién lo lleva. El anfitrión es una persona que generamos, nunca una real, salvo que nos mandes a alguien cuyos derechos tengas.":
    "One line on what you make and where it gets worn, and who wears it. The host is a person we generate — never a real one, unless you send us someone you hold the rights to.",
  "Una línea sobre tu mundo": "A line about your world",
  "Quién es el anfitrión": "Who the host is",
  "Dónde pasan las escenas": "Where the scenes happen",
  "Tu tienda de Shopify sigue mandando en productos, precios y checkout.":
    "Your Shopify store stays the source of truth for products, pricing and checkout.",
  "Ya está.": "That's it.",
  "Nosotros construimos la experiencia.": "We build the experience.",

  /* ------------------------------------------------------------ the wizard */
  "Cinco pasos y listo.": "Five steps and it's done.",
  "El paso dos lee tu tienda de verdad y te dice lo que hemos encontrado. No se sube nada y no se guarda nada.":
    "Step two reads your actual shop and tells you what we found. Nothing is uploaded and nothing is stored.",
  PASO: "STEP",
  "Tu catálogo": "Your catalogue",
  "Tu anfitrión": "Your host",
  "Tu mundo": "Your world",
  Listo: "Done",
  "Dirección de la tienda": "Shop address",
  "Tu tienda en directo, no el panel de Shopify.": "Your live storefront, not the Shopify admin.",
  "Una o dos letras para el símbolo y la pestaña del navegador. Si lo dejas, lo proponemos nosotros.":
    "One or two letters for the mark and the browser tab. Leave it and we propose one.",
  Español: "Spanish",
  Inglés: "English",
  "Leer el catálogo": "Read the catalogue",
  "Leemos tu feed público de Shopify y te decimos qué podemos poner sobre una persona, qué completa un look, y qué no hemos sabido colocar. Tarda unos segundos.":
    "We fetch your public Shopify feed and report what we can put on a person, what completes a look, and what we could not place. It takes a few seconds.",
  "Leyendo…": "Reading…",
  "Leerlo otra vez": "Read it again",
  "Leer mi catálogo": "Read my catalogue",
  Leyendo: "Reading",
  "tu tienda": "your shop",
  "No hemos podido leerla": "We could not read it",
  "No hemos podido leer esa tienda.": "We could not read that shop.",
  "Se ha cortado la conexión antes de terminar. Inténtalo otra vez.":
    "The connection dropped before we finished. Try again.",
  "Puedes seguir igualmente: una tienda con contraseña es algo normal y lo resolvemos contigo a mano.":
    "You can carry on anyway — a password-protected shop is a normal case, and we will sort it out with you by hand.",
  "Todavía no hemos leído nada. Este es el único paso que toca tu tienda.":
    "Nothing read yet. This is the only step that touches your shop.",
  "Necesitamos la dirección de tu tienda.": "We need your shop's address.",
  "Dinos cómo se llama la marca.": "Tell us what the brand is called.",
  "Nombre del anfitrión": "Host name",
  "Lo proponemos nosotros": "We propose one",
  "La persona que lleva tu ropa a lo largo de la experiencia.":
    "The person who wears your clothes through the experience.",
  "Enlace a una foto de referencia": "Reference photo link",
  "Opcional, y solo un enlace: nunca nos quedamos una copia. Manda únicamente a alguien de quien tengas permiso por escrito.":
    "Optional, and a link only — we never take a copy. Only send someone you have written permission to use.",
  "Quién es": "Who they are",
  "Una mujer de treinta y pocos, pelo oscuro, cercana y sin prisa.":
    "A woman in her early thirties, dark hair, warm and unhurried.",
  "Déjalo en blanco y te proponemos a alguien para que lo apruebes.":
    "Leave it blank and we will propose someone for you to approve.",
  "Camisas de lino y algodón para las noches de verano en el Mediterráneo.":
    "Linen and cotton shirting for warm evenings on the Mediterranean coast.",
  "Una línea: qué haces, con qué tejido, y dónde se lleva.":
    "One line: what you make, the fabric, and where it gets worn.",
  Escenas: "Scenes",
  "Una idea por línea, hasta": "One idea per line, up to",
  "ETIQUETA | descripción, o solo la descripción.": "LABEL | description, or just a description.",
  "Cómo las leemos": "How we read them",
  "Nada todavía. Si lo dejas en blanco, proponemos escenas desde tu mundo.":
    "Nothing yet. Leave it blank and we will propose scenes from your world.",
  "Eso son más de": "That is more than",
  "escenas.": "scenes.",
  "Dónde te contestamos": "Where do we reply",
  "Opcional. Sin esto no tenemos forma de volver a ti.":
    "Optional. Without it we have no way to come back to you.",
  "Algo ha fallado por nuestra parte. Inténtalo otra vez.":
    "Something went wrong on our end. Try again.",
  "Se ha cortado la conexión. No se ha perdido nada, inténtalo otra vez.":
    "The connection dropped. Nothing was lost — try again.",
  Atrás: "Back",
  "Crear mi experiencia": "Create my experience",
  Siguiente: "Next",
  "Enviando…": "Sending…",
  "Lo que vamos a construir": "What we are about to build",
  Marca: "Brand",
  Tienda: "Shop",
  Anfitrión: "Host",
  "lo proponemos": "we propose one",
  "las proponemos": "we propose them",
  Catálogo: "Catalogue",
  "prendas que se pueden llevar": "garments you can wear",
  "sin leer todavía": "not read yet",
  "Al enviar nos llega esta ficha y nada más. No se sube ninguna imagen y no guardamos ninguna.":
    "Submitting sends us this brief and nothing else. No images are uploaded and none are kept.",

  /* ----------------------------------------------------------- the report */
  "Productos leídos": "Products read",
  "Se pueden llevar": "Can be worn",
  "Completan un look": "Complete a look",
  "No hemos sabido colocar": "We could not place",
  "Esto ha sido una lectura parcial, corta a propósito para que la página no se quede colgada. El catálogo entero se lee otra vez, sin límite de tiempo, cuando se construye la experiencia.":
    "This was a partial read, kept short so the page stays responsive. The whole catalogue is read again, with no time limit, when the experience is built.",
  "Pestañas que montaríamos": "Picker tabs we would build",
  "Ninguna familia tiene productos suficientes para una pestaña. Habría que mirar este catálogo contigo.":
    "No family has enough products for a tab. We would need to look at this catalogue with you.",
  "Tramos de precio, de tus propios precios": "Budget bands, from your own prices",
  "Rango de precios": "Price range",
  Mediana: "Median",
  "cosas que conviene mirar": "things worth a look",

  /* --------------------------------------------------------- the building */
  "Ficha recibida": "Brief received",
  "está en camino.": "is on its way.",
  "Enviar otra marca": "Submit another brand",
  Lista: "Ready",
  "Se ha parado": "It stopped",
  Construyendo: "Building",
  "ya está en marcha.": "is live.",
  "no ha llegado a publicarse.": "did not get published.",
  "Estamos construyendo": "We are building",
  "Ya puedes abrirla. Pruébate tu propia ropa.": "You can open it now. Try on your own clothes.",
  "Algo se ha torcido durante la construcción. Ya lo sabemos y alguien lo está mirando; no hace falta que vuelvas a enviar nada.":
    "Something went wrong during the build. We know, and someone is looking at it — you don't need to submit anything again.",
  "Te escribimos a": "We will write to you at",
  "Tarda unos diez minutos. Puedes dejar esta página abierta.":
    "It takes about ten minutes. You can leave this page open.",
  "Leyendo tu catálogo": "Reading your catalogue",
  "Cogiendo los colores y la tipografía de tu web": "Taking the colours and type from your site",
  "Generando la fotografía": "Generating the photography",
  "Montando el sitio": "Assembling the site",
  Publicándolo: "Publishing it",
  "No te decimos por cuál va porque no lo sabemos: la máquina avisa cuando termina, no paso a paso. Preferimos no inventarnos una barra de progreso.":
    "We don't tell you which step it's on because we don't know: the machine reports when it finishes, not step by step. We would rather not invent a progress bar.",
  "Abrir mi experiencia": "Open my experience",
  Identificador: "Identifier",
  "Hemos rellenado lo que dejaste en blanco:": "We filled in what you left blank:",
  "No se ha subido ninguna imagen y no guardamos ninguna: tu catálogo y cualquier enlace de referencia se leen en directo, cada vez.":
    "No image was uploaded and none are kept: your catalogue and any reference link are read live, every time.",

  /* -------------------------------------------------------------- pricing */
  "Planes mensuales, sin vueltas.": "Simple monthly plans.",
  Inicio: "Starter",
  Crecimiento: "Growth",
  Escala: "Scale",
  "A medida": "Custom",
  Hablamos: "Talk to us",
  "al mes": "per month",
  "créditos al mes": "shopper credits / month",
  Elegir: "Choose",
  "Hasta 100 productos": "Up to 100 products",
  "Probador y Completa tu look": "Try-on and Complete my look",
  "Checkout en tu Shopify": "Shopify checkout handoff",
  "Analítica básica": "Basic analytics",
  "Hasta 1.000 productos": "Up to 1,000 products",
  "Escenas con IA y looks animados": "AI scenes and animated looks",
  "2 embajadores": "2 influencer models",
  "Analítica completa y test A/B": "Full analytics and A/B testing",
  "Catálogo sin límite": "Unlimited catalogue",
  "Embajadores a medida": "Custom influencer roster",
  "Apoyo creativo dedicado": "Dedicated creative support",
  "SLA y renderizado prioritario": "SLA and priority rendering",
  "Créditos de cliente": "Customer credits",
  "Ellos juegan. Tú mandas.": "Shoppers play. You stay in control.",
  "Cada acción de un cliente gasta créditos de tu plan. Pon límites por persona, premia a quien compra con créditos extra, y no te llevas sustos en la factura.":
    "Each shopper action uses credits from your plan. Set per-shopper limits, reward buyers with bonus credits, and never get a surprise bill.",
  "1 crédito": "1 credit",
  "2 créditos": "2 credits",
  "3 créditos": "3 credits",
  "4 créditos": "4 credits",
  "10 créditos": "10 credits",
  "Foto de escena con IA": "AI scene photo",
  "Foto con el embajador": "Influencer photo",
  "Look animado (vídeo)": "Animated look (video)",

  /* ------------------------------------------------------------ analytics */
  Analítica: "Analytics",
  "Mira qué se prueba la gente de verdad.": "See what shoppers actually wear.",
  Pruebas: "Try-ons",
  "Looks creados": "Looks created",
  "Veces compartido": "Shares",
  "Añadido al carrito": "Added to cart",
  "Panel de ejemplo — datos ilustrativos.": "Sample dashboard — illustrative data.",
  "Test A/B": "A/B split",
  "Tienda normal frente a tienda con experiencia.": "Normal store vs. experience store.",
  "Tienda normal": "Normal store",
  "Foto de producto estática": "Static product photo",
  "Una foto quieta. Baja, duda, se va.": "One static photo. Scroll, hesitate, leave.",
  "Tienda con experiencia": "Experience store",
  "Cliente con la prenda puesta mediante el probador con IA":
    "Shopper wearing the product via AI try-on",
  "Se la prueba, monta un look, lo comparte — y compra.":
    "Try it on, build a look, share it — then buy.",
  "Pon las dos en paralelo y mide la diferencia en tu propia analítica.":
    "Run both side by side and measure the difference in your own analytics.",
  "Primero el móvil": "Mobile first",
  "Hecho para el pulgar.": "Built for the thumb.",
  "Ponlo en una escena": "Put it in a scene",
  "Llévalo con un creador": "Wear it with a creator",

  /* ---------------------------------------------------------- final + foot */
  "Deja que se pongan": "Let people",
  "tu marca.": "wear your brand.",
  "Lanza una experiencia de moda con IA sobre tu tienda de Shopify en días, no en meses.":
    "Launch an AI fashion experience on top of your Shopify store in days, not months.",
  "Funciona sobre la tienda de Shopify que ya tienes.":
    "Works with the Shopify store you already have.",

  /* ---------------------------------------------------------- phone demo */
  "El Estudio": "The Studio",
  "El cliente con la prenda, generado con IA": "Shopper wearing the garment, generated by AI",
  "Tu foto": "Your photo",
  Generando: "Generating",
  "Generando…": "Generating…",
  "Probar otra": "Try another",
  "Hazte una foto": "Create a photo",
  "Con nuestro embajador": "With our influencer",
  Vestido: "Dress",

  /* --------------------------------------------------------------- titles */
  "Deanna Fashion — Experiencias de moda con IA para marcas en Shopify":
    "Deanna Fashion — AI try-on experiences for Shopify fashion brands",
  "Convierte tu catálogo de Shopify en una experiencia de moda con IA: probador, looks, escenas y contenido con embajadores que vende.":
    "Turn your Shopify catalogue into an interactive AI fashion experience: try-ons, looks, scenes and influencer content that sells.",

  /* ---------------------------------------------------------------- misc */
  "Demasiadas consultas. Espera un momento.": "Too many requests. Give it a moment.",
};
