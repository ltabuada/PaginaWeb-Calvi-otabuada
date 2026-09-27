# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two groups: (1) people in Buenos Aires (Villa Devoto and surrounding barrios) looking to rent or buy residential property — departamentos, casas, PH — and browsing/filtering listings; (2) property owners who want to sell, rent, or get a free appraisal (tasación) of their property. Secondary: investors evaluating pre-sale developments (emprendimientos) or commercial units (local, oficina, galpón, terreno).

## Product Purpose

Marketing and lead-generation site for an established neighborhood real estate agency. Showcases current listings (alquiler/venta) and in-development projects (emprendimientos), lets visitors search/filter properties, view detail pages, and submit inquiries (general contact form, per-listing consultas). Success = qualified inquiries and calls/WhatsApp contacts.

## Positioning

A long-established, personal neighborhood agency (35+ years in Villa Devoto) — not a large anonymous portal. The differentiator is full-service accompaniment: legal/documentation handling, market-accurate free appraisals, and direct relationships built over decades, evidenced by real client testimonials.

## Operating Context

Physical office at Av. Mosconi 2804, Villa Devoto, Buenos Aires, Argentina. Visitors reach the agency via phone, WhatsApp, email, Instagram, or Facebook, and via the on-site contact form and embedded map. Content (listings, emprendimientos, consultas) is managed by staff through an existing Admin panel backed by Firebase; this redesign does not touch that panel or the data layer.

## Capabilities and Constraints

- React + Vite SPA, React Router, plain CSS (no Tailwind/UI framework) in `src/index.css`.
- Data layer: Firebase (auth, Firestore, storage) via `AuthContext`, `ListingsContext`, `EmprendimientosContext`, `ConsultasContext` — must not be modified.
- **This redesign is frontend-only**: JSX structure/markup and CSS may change freely; contexts, Firebase calls, routing logic, and the Admin login/panel pages are out of scope and stay as-is (functionally and visually).
- Property categories span residential (departamento, casa, PH) and non-residential (terreno, galpón, local, oficina, otros); visual tone should read residential-premium first without hiding the other categories.
- Real photography exists in `/public` for the office and several actual listings (no placeholder/stock imagery needed for those).

## Brand Commitments

- Name: "Calviño Tabuada Propiedades" (also styled "CalviñoTabuada Propiedades").
- Logo assets in `/public`: `Logo.png`, `LogoInicio.png`, `LogoLargo.jpeg`, `LogoCircular.jpeg`.
- Contact: Av. Mosconi 2804, Buenos Aires; tel +54 11 4571-3005; WhatsApp +54 9 11 4571-3005; email calvinotabuada@hotmail.com.
- Social: Instagram @calvinotabuada, Facebook /inmobiliaria2804.
- Stats and client testimonials already written into `Home.jsx` (35+ años de experiencia, 120+ obras comercializadas, testimonials from Graciela P., Martín S., Valeria R.) are confirmed real content — preserve verbatim, redesign only their visual presentation.

## Evidence on Hand

Real photography in `/public`: office/storefront (`Frente.jpeg`), and actual property listings (`Campana 4826.jpeg`, `Ceretti3265.jpeg`, `Habana 2602.jpeg`, `Habana y Terrada.jpeg`, `Terraza Habana Terrada.jpeg`, `cochera Habana Terrrada.jpeg`, `quincho Habana Terrada.jpeg`, `fotoSlide.jpeg`). No stock/placeholder imagery should replace these where a real photo is available; additional listing photos beyond `/public` come from Firebase storage via `ListingsContext` at runtime.

## Product Principles

1. Trust through longevity: 35+ years should read as earned heritage, not a generic "luxury real estate" template look.
2. Personalized full-service is the differentiator (legal/documentation support) — keep it visible, not buried in a feature list.
3. Real properties, real photos: use the agency's actual office and listing photography instead of stock imagery wherever available.
4. Residential-first tone, without hiding commercial/investment categories already in the product.
5. Redesign is scoped to public-facing surfaces (Home, Listings, ListingDetail, Emprendimientos, Navbar, Footer); Admin stays functionally and visually as-is.
