const staticPhoneStore = "phone-store-site-v1"
const assets = [
  "/",
  "/index.html",
  "/images/logo.png",
  "/js/app.js",
  "contact.html",
  "aboutus.html",
]

self.addEventListener("install", installEvent => {
  installEvent.waitUntil(
    caches.open(staticPhoneStore).then(cache => {
      cache.addAll(assets)
    })
  )
})
