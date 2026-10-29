import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@react-router/node";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { Links, Meta, Outlet, Scripts, ScrollRestoration, ServerRouter, UNSAFE_withComponentProps, UNSAFE_withErrorBoundaryProps, data, isRouteErrorResponse, useLocation } from "react-router";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { Fragment as Fragment$1, useCallback, useEffect, useId, useRef, useState } from "react";
import { Aperture, ArrowDown, ArrowLeft, ArrowUpRight, Braces, Check, Crosshair, Layers, Menu, Orbit, RadioTower, Sparkle, X } from "lucide-react";
import * as THREE from "three";
import PocketBase, { ClientResponseError } from "pocketbase";
import ipaddr from "ipaddr.js";
import { RateLimiterMemory, RateLimiterRes } from "rate-limiter-flexible";
// \0rolldown/runtime.js
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
// src/entry.server.tsx
var entry_server_exports = /* @__PURE__ */ __exportAll({
	default: () => handleRequest,
	streamTimeout: () => streamTimeout
});
var streamTimeout = 5e3;
function appendComponentStack(error, errorInfo) {
	const componentStack = errorInfo?.componentStack;
	if (!(error instanceof Error) || !componentStack || error.stack?.includes(componentStack)) return;
	const separator = componentStack.startsWith("\n") ? "" : "\n";
	try {
		error.stack = `${error.stack ?? `${error.name}: ${error.message}`}${separator}${componentStack}`;
	} catch {}
}
function handleRequest(request, responseStatusCode, responseHeaders, routerContext, loadContext) {
	if (request.method.toUpperCase() === "HEAD") return new Response(null, {
		status: responseStatusCode,
		headers: responseHeaders
	});
	return new Promise((resolve, reject) => {
		let shellRendered = false;
		const userAgent = request.headers.get("user-agent");
		const readyOption = userAgent && isbot(userAgent) || routerContext.isSpaMode ? "onAllReady" : "onShellReady";
		let timeoutId = setTimeout(() => abort(), 6e3);
		const { pipe, abort } = renderToPipeableStream(/* @__PURE__ */ jsx(ServerRouter, {
			context: routerContext,
			url: request.url
		}), {
			[readyOption]() {
				shellRendered = true;
				const body = new PassThrough({ final(callback) {
					clearTimeout(timeoutId);
					timeoutId = void 0;
					callback();
				} });
				const stream = createReadableStreamFromReadable(body);
				responseHeaders.set("Content-Type", "text/html");
				pipe(body);
				resolve(new Response(stream, {
					headers: responseHeaders,
					status: responseStatusCode
				}));
			},
			onShellError(error) {
				reject(error);
			},
			onError(error, errorInfo) {
				appendComponentStack(error, errorInfo);
				responseStatusCode = 500;
				if (shellRendered) console.error(error);
			}
		});
	});
}
// src/index.css?url
var src_default = "/assets/index-CNn0awCt.css";
// src/lib/cookie-consent.ts
var CONSENT_COOKIE = "cc_cookie";
var CONSENT_MAX_AGE_SECONDS = 15724800;
var CONSENT_EVENT = "cc:onConsent";
var CONSENT_CHANGE_EVENT = "cc:onChange";
var PREFERENCES_REQUESTED_EVENT = "horizons:cookie-preferences-requested";
/**
* Cookie categories the visitor chooses between. `Necessary` is always granted.
* The store's Google Analytics stores cookies only with `Analytics`, its Meta Pixel
* loads only with `Marketing`, and checkout lets Hostinger's own analytics
* (Amplitude) use cookies only with `PlatformAnalytics`. Gate any script you add
* the same way.
*/
var CookieConsentCategory = {
	Necessary: "necessary",
	Analytics: "analytics",
	Marketing: "marketing",
	PlatformAnalytics: "platformAnalytics"
};
/** The categories the visitor accepted, or `null` before they have chosen. Browser only. */
function getConsentCategories() {
	if (typeof document === "undefined") return null;
	const prefix = `${CONSENT_COOKIE}=`;
	const cookie = document.cookie.split("; ").find((entry) => entry.startsWith(prefix));
	try {
		const categories = cookie ? JSON.parse(decodeURIComponent(cookie.slice(prefix.length))).categories : null;
		return Array.isArray(categories) ? categories : null;
	} catch {
		return null;
	}
}
function hasConsentDecision() {
	return getConsentCategories() !== null;
}
function isConsentGranted(category) {
	return !!getConsentCategories()?.includes(category);
}
/** Stores the visitor's choice and tells the platform's tracking about it. */
function saveConsent({ analytics, marketing, platformAnalytics }) {
	const isFirstDecision = !hasConsentDecision();
	const categories = [
		CookieConsentCategory.Necessary,
		...analytics ? [CookieConsentCategory.Analytics] : [],
		...marketing ? [CookieConsentCategory.Marketing] : [],
		...platformAnalytics ? [CookieConsentCategory.PlatformAnalytics] : []
	];
	const value = encodeURIComponent(JSON.stringify({
		categories,
		consentTimestamp: (/* @__PURE__ */ new Date()).toISOString()
	}));
	document.cookie = `${CONSENT_COOKIE}=${value}; max-age=${CONSENT_MAX_AGE_SECONDS}; path=/; SameSite=Lax`;
	window.dispatchEvent(new CustomEvent(isFirstDecision ? CONSENT_EVENT : CONSENT_CHANGE_EVENT, { detail: { categories } }));
}
function acceptAllCookies() {
	saveConsent({
		analytics: true,
		marketing: true,
		platformAnalytics: true
	});
}
function rejectOptionalCookies() {
	saveConsent({
		analytics: false,
		marketing: false,
		platformAnalytics: false
	});
}
/** Reopens the preferences for a "Cookie settings" link, typically in the footer. */
function openCookiePreferences() {
	window.dispatchEvent(new Event(PREFERENCES_REQUESTED_EVENT));
}
/** Lets the banner react to `openCookiePreferences`. Returns the unsubscribe function. */
function onCookiePreferencesRequested(callback) {
	window.addEventListener(PREFERENCES_REQUESTED_EVENT, callback);
	return () => window.removeEventListener(PREFERENCES_REQUESTED_EVENT, callback);
}
// src/hooks/use-cookie-banner.ts
var NO_OPTIONAL_COOKIES = {
	analytics: false,
	marketing: false,
	platformAnalytics: false
};
var grantedChoices = () => ({
	analytics: isConsentGranted(CookieConsentCategory.Analytics),
	marketing: isConsentGranted(CookieConsentCategory.Marketing),
	platformAnalytics: isConsentGranted(CookieConsentCategory.PlatformAnalytics)
});
/**
* Everything the site's cookie banner does, and nothing about how it looks:
* render whatever markup fits the site from these values.
*
* - `isOpen` is false on the server and during hydration, then true until the
*   visitor decides, so the banner never flashes for someone who already chose.
* - A footer "Cookie settings" link calling `openCookiePreferences()` from
*   `@/lib/cookie-consent` reopens it with `isCustomizing` true and the toggles
*   pre-filled from what the visitor granted before.
* - Toggles start unticked: never pre-tick an optional category.
*
*   const banner = useCookieBanner();
*   if (!banner.isOpen) return null;
*   // banner.acceptAll, banner.rejectOptional, banner.customize,
*   // banner.choices + banner.setChoice('analytics', checked), banner.saveChoices
*/
function useCookieBanner() {
	const [isOpen, setIsOpen] = useState(false);
	const [isCustomizing, setIsCustomizing] = useState(false);
	const [choices, setChoices] = useState(NO_OPTIONAL_COOKIES);
	useEffect(() => {
		setIsOpen(!hasConsentDecision());
		return onCookiePreferencesRequested(() => {
			setChoices(grantedChoices());
			setIsCustomizing(true);
			setIsOpen(true);
		});
	}, []);
	const finish = useCallback((save) => {
		save();
		setIsCustomizing(false);
		setIsOpen(false);
	}, []);
	return {
		isOpen,
		isCustomizing,
		choices,
		setChoice: useCallback((category, isGranted) => {
			setChoices((current) => ({
				...current,
				[category]: isGranted
			}));
		}, []),
		customize: useCallback(() => {
			setChoices(grantedChoices());
			setIsCustomizing(true);
		}, []),
		acceptAll: useCallback(() => finish(acceptAllCookies), [finish]),
		rejectOptional: useCallback(() => finish(rejectOptionalCookies), [finish]),
		saveChoices: useCallback(() => finish(() => saveConsent(choices)), [finish, choices])
	};
}
// src/components/cookie-banner.tsx
function CookieBanner() {
	const banner = useCookieBanner();
	if (!banner.isOpen) return null;
	return /* @__PURE__ */ jsxs("section", {
		className: "cookie-banner",
		role: "dialog",
		"aria-label": "Cookie preferences",
		children: [
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h2", { children: "A little clarity on cookies." }), /* @__PURE__ */ jsx("p", { children: "We use essential cookies to run this site. Optional cookies help measure visits and improve the experience." })] }),
			banner.isCustomizing && /* @__PURE__ */ jsx("fieldset", { children: [
				{
					key: "analytics",
					title: "Analytics",
					description: "Visitor statistics for this site."
				},
				{
					key: "marketing",
					title: "Marketing",
					description: "Ad measurement and personalised advertising."
				},
				{
					key: "platformAnalytics",
					title: "Platform analytics",
					description: "Hostinger uses Amplitude to improve the site and checkout experience without directly identifying you."
				}
			].map((item) => /* @__PURE__ */ jsxs("label", { children: [/* @__PURE__ */ jsx("input", {
				type: "checkbox",
				checked: banner.choices[item.key],
				onChange: (e) => banner.setChoice(item.key, e.target.checked)
			}), /* @__PURE__ */ jsxs("span", { children: [item.title, /* @__PURE__ */ jsx("small", { children: item.description })] })] }, item.key)) }),
			/* @__PURE__ */ jsxs("div", {
				className: "cookie-actions",
				children: [
					/* @__PURE__ */ jsx("button", {
						onClick: banner.rejectOptional,
						children: "Reject optional"
					}),
					/* @__PURE__ */ jsx("button", {
						onClick: banner.isCustomizing ? banner.saveChoices : banner.customize,
						children: banner.isCustomizing ? "Save choices" : "Customise"
					}),
					/* @__PURE__ */ jsx("button", {
						onClick: banner.acceptAll,
						children: "Accept all"
					})
				]
			})
		]
	});
}
// src/lib/site-origin.server.ts
var LOCAL_HOSTNAMES = /* @__PURE__ */ new Set([
	"localhost",
	"127.0.0.1",
	"0.0.0.0",
	"[::1]"
]);
/**
* The public origin of this site, e.g. `https://example.com`. Use it for
* absolute URLs that leave the app — sitemap `<loc>`, canonical links, `og:url`.
*
* The scheme comes from the hostname because the request cannot report it: TLS
* terminates at the proxy, so `request.url` and `X-Forwarded-Proto` both say
* `http` even for a visitor who arrived over HTTPS. Trusting either publishes
* `http://` URLs that only redirect, which search engines index as a second,
* duplicate site. Every host this app is reachable on serves HTTPS except a
* local `npm run start`, which is where the `curl` checks in the SEO skill run.
*
* `Host` carries the public domain, and only the origin is read, so the `.data`
* suffix React Router adds to `request.url` on client navigations does not
* matter.
*/
var siteOrigin = (request) => {
	const { host, hostname } = new URL(request.url);
	return `${LOCAL_HOSTNAMES.has(hostname) ? "http" : "https"}://${host}`;
};
function HorizonsPreviewScripts() {
	useEffect(() => {
		window.__horizonsHydrated = true;
		window.dispatchEvent(new Event("horizons:hydrated"));
		import("./assets/_virtual_horizons-runtime-DhO5t91P.js");
	}, []);
	return null;
}
// src/root.tsx
var root_exports = /* @__PURE__ */ __exportAll({
	ErrorBoundary: () => ErrorBoundary,
	Layout: () => Layout,
	default: () => root_default,
	headers: () => headers,
	links: () => links,
	loader: () => loader$7
});
var links = () => [
	{
		rel: "stylesheet",
		href: src_default
	},
	{
		rel: "icon",
		href: "/favicon.png",
		type: "image/png"
	},
	{
		rel: "preconnect",
		href: "https://fonts.googleapis.com"
	},
	{
		rel: "preconnect",
		href: "https://fonts.gstatic.com",
		crossOrigin: "anonymous"
	},
	{
		rel: "stylesheet",
		href: "https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap"
	}
];
/**
* Publishes the site's public origin, which `seo()` reads to build canonical and
* `og:url` tags, and advertises the sitemap to crawlers that read response
* headers rather than HTML.
*
* A `meta` export can only reach server data through `matches`, and the `headers`
* export cannot see loader data at all, so both have to travel this way.
*/
function loader$7({ request }) {
	const origin = siteOrigin(request);
	return data({ origin }, { headers: { Link: `<${origin}/sitemap.xml>; rel="sitemap"; type="application/xml"` } });
}
/**
* A page route that exports `headers` replaces this one, so merge `parentHeaders`
* there rather than returning only that route's own headers.
*/
function headers({ loaderHeaders }) {
	return loaderHeaders;
}
function Layout({ children }) {
	return /* @__PURE__ */ jsxs("html", {
		lang: "en",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ jsxs("head", { children: [
			/* @__PURE__ */ jsx("meta", { charSet: "utf-8" }),
			/* @__PURE__ */ jsx("meta", {
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			}),
			/* @__PURE__ */ jsx(Meta, {}),
			/* @__PURE__ */ jsx(Links, {}),
			/* @__PURE__ */ jsx(HorizonsPreviewScripts, {})
		] }), /* @__PURE__ */ jsxs("body", {
			suppressHydrationWarning: true,
			children: [
				/* @__PURE__ */ jsx("div", {
					id: "root",
					children
				}),
				/* @__PURE__ */ jsx(CookieBanner, {}),
				/* @__PURE__ */ jsx(ScrollRestoration, {}),
				/* @__PURE__ */ jsx(Scripts, {})
			]
		})]
	});
}
var root_default = UNSAFE_withComponentProps(function App() {
	return /* @__PURE__ */ jsx(Outlet, {});
});
var ErrorBoundary = UNSAFE_withErrorBoundaryProps(function ErrorBoundary({ error }) {
	let message = "Oops!";
	let details = "An unexpected error occurred.";
	if (isRouteErrorResponse(error)) {
		message = error.status === 404 ? "404" : "Error";
		details = error.status === 404 ? "The requested page could not be found." : error.statusText || details;
	}
	return /* @__PURE__ */ jsxs("main", { children: [
		/* @__PURE__ */ jsx("h1", { children: message }),
		/* @__PURE__ */ jsx("p", { children: details }),
		null
	] });
});
// src/lib/seo.ts
var ROOT_ROUTE_ID = "root";
/** The site's public origin, as published by the root loader. */
var siteOriginFrom = (matches) => {
	return (matches.find((match) => match?.id === ROOT_ROUTE_ID)?.loaderData)?.origin ?? "";
};
var absoluteUrl = (origin, target) => {
	if (/^https?:\/\//.test(target)) return target;
	return `${origin}${target.startsWith("/") ? target : `/${target}`}`;
};
function seo({ matches, location }, input) {
	const origin = siteOriginFrom(matches);
	const canonical = absoluteUrl(origin, input.path ?? location.pathname);
	const imageUrl = input.image ? absoluteUrl(origin, input.image) : "";
	const tags = [
		{ title: input.title },
		{
			name: "description",
			content: input.description
		},
		{
			property: "og:title",
			content: input.title
		},
		{
			property: "og:description",
			content: input.description
		},
		{
			property: "og:type",
			content: input.type ?? "website"
		},
		{
			name: "twitter:card",
			content: imageUrl ? "summary_large_image" : "summary"
		},
		{
			name: "twitter:title",
			content: input.title
		},
		{
			name: "twitter:description",
			content: input.description
		}
	];
	if (origin) tags.push({
		tagName: "link",
		rel: "canonical",
		href: canonical
	}, {
		property: "og:url",
		content: canonical
	});
	if (imageUrl) tags.push({
		property: "og:image",
		content: imageUrl
	}, {
		name: "twitter:image",
		content: imageUrl
	});
	if (input.noindex) tags.push({
		name: "robots",
		content: "noindex"
	});
	for (const block of [input.jsonLd ?? []].flat()) tags.push({ "script:ld+json": block });
	return tags;
}
// src/components/home/particle-globe.tsx
function noise(x, y, z) {
	let n = Math.sin(x * 3) + Math.cos(y * 3) + Math.sin(z * 3);
	n += Math.sin(x * 6 + y * 2) * .5;
	n += Math.cos(y * 6 + z * 2) * .5;
	return n / 2;
}
function createGlowTexture() {
	const canvas = document.createElement("canvas");
	canvas.width = 64;
	canvas.height = 64;
	const ctx = canvas.getContext("2d");
	const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
	gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
	gradient.addColorStop(.2, "rgba(100, 200, 255, 0.8)");
	gradient.addColorStop(.5, "rgba(0, 50, 255, 0.2)");
	gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, 64, 64);
	return new THREE.CanvasTexture(canvas);
}
/**
* Interactive particle globe — the cinematic opening visual for the homepage.
* Auto-rotates with a soft reflection and surface glow, and tilts gently
* toward the pointer on desktop. Particle density and pixel ratio are reduced
* on mobile for performance, and all motion is skipped under reduced-motion.
*/
function ParticleGlobe() {
	const containerRef = useRef(null);
	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;
		const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		const isMobile = window.innerWidth < 768;
		let width = container.clientWidth;
		let height = container.clientHeight;
		const scene = new THREE.Scene();
		scene.fog = new THREE.FogExp2(198676, .025);
		const camera = new THREE.PerspectiveCamera(45, width / height, .1, 1e3);
		camera.position.set(0, 5, 25);
		const renderer = new THREE.WebGLRenderer({
			alpha: true,
			antialias: !isMobile
		});
		renderer.setSize(width, height);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
		container.appendChild(renderer.domElement);
		const glowTexture = createGlowTexture();
		const radius = 8;
		const widthSegments = isMobile ? 130 : 200;
		const heightSegments = isMobile ? 65 : 100;
		const globeGroup = new THREE.Group();
		scene.add(globeGroup);
		const positions = [];
		const colors = [];
		const reflectionColors = [];
		const colorLand = new THREE.Color(14544639);
		const colorOcean = new THREE.Color(13226);
		const colorHighlight = new THREE.Color(16777215);
		for (let i = 0; i <= heightSegments; i++) {
			const lat = (i / heightSegments - .5) * Math.PI;
			for (let j = 0; j <= widthSegments; j++) {
				const lon = j / widthSegments * Math.PI * 2;
				const x = radius * Math.cos(lat) * Math.cos(lon);
				const y = radius * Math.sin(lat);
				const z = radius * Math.cos(lat) * Math.sin(lon);
				const isLand = noise(x * .15, y * .15, z * .15) > .1;
				if (isLand || Math.random() > .85) {
					positions.push(x, y, z);
					if (isLand) {
						if (Math.random() > .98) {
							colors.push(colorHighlight.r, colorHighlight.g, colorHighlight.b);
							reflectionColors.push(colorHighlight.r, colorHighlight.g, colorHighlight.b);
						} else {
							colors.push(colorLand.r, colorLand.g, colorLand.b);
							reflectionColors.push(colorLand.r * .5, colorLand.g * .5, colorLand.b * .5);
						}
					} else {
						colors.push(colorOcean.r, colorOcean.g, colorOcean.b);
						reflectionColors.push(colorOcean.r * .2, colorOcean.g * .2, colorOcean.b * .2);
					}
				}
			}
		}
		const geometry = new THREE.BufferGeometry();
		geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
		geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
		const material = new THREE.PointsMaterial({
			size: .25,
			map: glowTexture,
			transparent: true,
			opacity: .9,
			vertexColors: true,
			blending: THREE.AdditiveBlending,
			depthWrite: false
		});
		const globe = new THREE.Points(geometry, material);
		globeGroup.add(globe);
		const reflectionGeometry = new THREE.BufferGeometry();
		reflectionGeometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
		reflectionGeometry.setAttribute("color", new THREE.Float32BufferAttribute(reflectionColors, 3));
		const reflectionMaterial = new THREE.PointsMaterial({
			size: .25,
			map: glowTexture,
			transparent: true,
			opacity: .25,
			vertexColors: true,
			blending: THREE.AdditiveBlending,
			depthWrite: false
		});
		const reflection = new THREE.Points(reflectionGeometry, reflectionMaterial);
		reflection.scale.y = -1;
		reflection.position.y = -16.4;
		globeGroup.add(reflection);
		const planeGeometry = new THREE.PlaneGeometry(100, 100);
		const planeMaterial = new THREE.MeshBasicMaterial({
			color: 0,
			transparent: true,
			opacity: .7,
			depthWrite: false
		});
		const plane = new THREE.Mesh(planeGeometry, planeMaterial);
		plane.rotation.x = -Math.PI / 2;
		plane.position.y = -8.2;
		scene.add(plane);
		const ambientLight = new THREE.PointLight(26367, 1, 30);
		ambientLight.position.set(0, -8, 0);
		scene.add(ambientLight);
		const clock = new THREE.Clock();
		let rafId = 0;
		let targetX = 0;
		const onPointerMove = (e) => {
			targetX = (e.clientX / window.innerWidth - .5) * 3;
		};
		window.addEventListener("pointermove", onPointerMove);
		function animate() {
			rafId = requestAnimationFrame(animate);
			const t = clock.getElapsedTime();
			globeGroup.rotation.y = t * .05;
			globeGroup.position.y = Math.sin(t * .5) * .2;
			camera.position.x += (targetX - camera.position.x) * .03;
			camera.lookAt(0, 0, 0);
			renderer.render(scene, camera);
		}
		if (reduceMotion) renderer.render(scene, camera);
		else animate();
		function onResize() {
			width = container.clientWidth;
			height = container.clientHeight;
			camera.aspect = width / height;
			camera.updateProjectionMatrix();
			renderer.setSize(width, height);
		}
		window.addEventListener("resize", onResize);
		return () => {
			cancelAnimationFrame(rafId);
			window.removeEventListener("pointermove", onPointerMove);
			window.removeEventListener("resize", onResize);
			geometry.dispose();
			reflectionGeometry.dispose();
			planeGeometry.dispose();
			material.dispose();
			reflectionMaterial.dispose();
			planeMaterial.dispose();
			glowTexture.dispose();
			renderer.dispose();
			if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
		};
	}, []);
	return /* @__PURE__ */ jsx("div", {
		ref: containerRef,
		className: "particle-globe",
		"aria-hidden": "true"
	});
}
// src/components/home/hero.tsx
function Hero({ settings }) {
	const subtextLines = settings.hero_subtext.split("\n");
	return /* @__PURE__ */ jsxs("section", {
		className: "hero",
		id: "top",
		children: [
			/* @__PURE__ */ jsx(ParticleGlobe, {}),
			/* @__PURE__ */ jsx("div", { className: "hero-shade" }),
			/* @__PURE__ */ jsxs("div", {
				className: "hero-content",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "eyebrow",
						children: [
							/* @__PURE__ */ jsx("span", { className: "status-dot" }),
							" ",
							settings.hero_eyebrow
						]
					}),
					/* @__PURE__ */ jsxs("h1", { children: [
						settings.hero_headline_1,
						/* @__PURE__ */ jsx("br", {}),
						settings.hero_headline_2,
						" ",
						/* @__PURE__ */ jsx("span", { children: settings.hero_headline_3 })
					] }),
					/* @__PURE__ */ jsx("div", {
						className: "hero-bottom",
						children: /* @__PURE__ */ jsx("p", { children: subtextLines.map((line, i) => /* @__PURE__ */ jsxs(Fragment$1, { children: [i > 0 && /* @__PURE__ */ jsx("br", {}), line] }, i)) })
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "hero-rail",
				children: [/* @__PURE__ */ jsxs("a", {
					href: "#experience",
					children: [/* @__PURE__ */ jsx(ArrowDown, { size: 15 }), " SCROLL TO DISCOVER"]
				}), /* @__PURE__ */ jsx("span", { children: "ART. TECHNOLOGY. ABOVE EVERYTHING." })]
			})
		]
	});
}
// src/components/home/experience.tsx
function Experience() {
	return /* @__PURE__ */ jsxs("section", {
		className: "experience section-wrap",
		id: "experience",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "caption-rail",
			children: [/* @__PURE__ */ jsx("span", {
				className: "section-number",
				children: "01 / THE EXPERIENCE"
			}), /* @__PURE__ */ jsx("span", { children: "IMAGINATION, ENGINEERED." })]
		}), /* @__PURE__ */ jsxs("div", {
			className: "experience-body",
			children: [
				/* @__PURE__ */ jsxs("h2", { children: [
					"Not just a show.",
					/* @__PURE__ */ jsx("br", {}),
					/* @__PURE__ */ jsx("span", { children: "A shift in perspective." })
				] }),
				/* @__PURE__ */ jsx("p", {
					className: "intro-copy",
					children: "We turn the night sky into a living canvas. Choreographed drones move as one, creating luminous shapes, sweeping movement and moments of pure wonder."
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "service-lines",
					children: [
						/* @__PURE__ */ jsxs("div", { children: [
							/* @__PURE__ */ jsx(Orbit, { size: 23 }),
							/* @__PURE__ */ jsx("h3", { children: "Designed around your vision" }),
							/* @__PURE__ */ jsx("p", { children: "A visual narrative shaped by your ideas, brought to life in light." })
						] }),
						/* @__PURE__ */ jsxs("div", { children: [
							/* @__PURE__ */ jsx(Crosshair, { size: 23 }),
							/* @__PURE__ */ jsx("h3", { children: "Precision in every movement" }),
							/* @__PURE__ */ jsx("p", { children: "Artistic choreography and carefully coordinated flight, working in harmony." })
						] }),
						/* @__PURE__ */ jsxs("div", { children: [
							/* @__PURE__ */ jsx(Layers, { size: 23 }),
							/* @__PURE__ */ jsx("h3", { children: "Considered from start to sky" }),
							/* @__PURE__ */ jsx("p", { children: "Creative development, technical planning and professional show delivery." })
						] })
					]
				})
			]
		})]
	});
}
// src/lib/cms-media.ts
function cmsImageUrl(record, fileField, urlField, fallback = "") {
	const values = record;
	const filename = values[fileField];
	if (typeof filename === "string" && filename && record.id) {
		const collection = record.collectionName || "articles";
		return `/hcgi/platform/api/files/${encodeURIComponent(collection)}/${encodeURIComponent(record.id)}/${encodeURIComponent(filename)}`;
	}
	const externalUrl = values[urlField];
	return typeof externalUrl === "string" && externalUrl ? externalUrl : fallback;
}
// src/data/performance-media.ts
var defaultSettings = {
	opening_image: "https://images.hostinger.com/cf8a50bf-40b7-467e-9ba0-86cc7ca1a9d3/7cf1a1c7-e1b7-4dad-9417-6051d32dd038.png",
	opening_video: "",
	hero_eyebrow: "DRONE LIGHT PERFORMANCES",
	hero_headline_1: "The sky is",
	hero_headline_2: "only the",
	hero_headline_3: "beginning.",
	hero_subtext: "Extraordinary light. Perfectly choreographed.\nA spectacle that stays with you."
};
var defaultMedia = [{
	title: "Light in motion",
	detail: "Fluid forms · Infinite possibilities",
	image: "https://images.hostinger.com/cf8a50bf-40b7-467e-9ba0-86cc7ca1a9d3/e2fa714b-b8aa-4dc5-a061-320246660545.png",
	alt: "Blue points of light creating a flowing wave across the night sky"
}, {
	title: "A new dimension",
	detail: "Precision formations · Monumental scale",
	image: "https://images.hostinger.com/cf8a50bf-40b7-467e-9ba0-86cc7ca1a9d3/bba4f474-83f0-47b7-9324-6308fa422e11.png",
	alt: "White points of light arranged in a geometric starburst over water"
}];
function mediaSrcSet(url) {
	if (url.startsWith("/hcgi/")) return "";
	return `${url}?width=375 375w, ${url}?width=768 768w, ${url}?width=1024 1024w, ${url} 1344w`;
}
function preparePerformanceItem(item) {
	return {
		...item,
		image: cmsImageUrl(item, "image_file", "image", item.image)
	};
}
// src/components/home/showcase.tsx
function Showcase({ items }) {
	const dialog = useRef(null);
	const [selected, setSelected] = useState(0);
	const safeItems = items.length > 0 ? items : [];
	const current = safeItems[selected];
	return /* @__PURE__ */ jsxs("section", {
		className: "showcase section-wrap",
		id: "showcase",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "showcase-heading",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
					className: "section-number",
					children: "02 / VISUAL POSSIBILITIES"
				}), /* @__PURE__ */ jsxs("h2", { children: [
					"Look up.",
					/* @__PURE__ */ jsx("br", {}),
					/* @__PURE__ */ jsx("span", { children: "Feel something." })
				] })] }), /* @__PURE__ */ jsxs("p", { children: [
					"A canvas without boundaries.",
					/* @__PURE__ */ jsx("br", {}),
					"An impression beyond the ordinary."
				] })]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "showcase-grid",
				children: safeItems.map((item, index) => /* @__PURE__ */ jsxs("figure", { children: [/* @__PURE__ */ jsxs("button", {
					className: "image-open",
					"aria-label": `View ${item.title}`,
					onClick: () => {
						setSelected(index);
						dialog.current?.showModal();
					},
					children: [/* @__PURE__ */ jsx("img", {
						src: item.image,
						srcSet: mediaSrcSet(item.image) || void 0,
						sizes: "(min-width: 768px) 46vw, 100vw",
						alt: item.alt,
						loading: "lazy"
					}), /* @__PURE__ */ jsx("span", {
						className: "image-arrow",
						children: /* @__PURE__ */ jsx(ArrowUpRight, { size: 21 })
					})]
				}), /* @__PURE__ */ jsxs("figcaption", { children: [/* @__PURE__ */ jsxs("span", {
					className: "media-index",
					children: ["0", index + 1]
				}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", { children: item.title }), /* @__PURE__ */ jsx("span", { children: item.detail })] })] })] }, item.id ?? index))
			}),
			/* @__PURE__ */ jsx("p", {
				className: "visual-note",
				children: "Concept imagery — an illustration of the creative possibilities of drone light shows."
			}),
			/* @__PURE__ */ jsxs("dialog", {
				ref: dialog,
				className: "lightbox",
				onClick: (e) => {
					if (e.target === e.currentTarget) dialog.current?.close();
				},
				children: [/* @__PURE__ */ jsx("button", {
					className: "lightbox-close",
					onClick: () => dialog.current?.close(),
					"aria-label": "Close image",
					children: /* @__PURE__ */ jsx(X, {})
				}), current && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("img", {
					src: current.image,
					alt: current.alt
				}), /* @__PURE__ */ jsx("p", { children: current.title })] })]
			})
		]
	});
}
var pocketbaseClient = new PocketBase("/hcgi/platform");
// src/hooks/use-form-submission.ts
/** Name of the hidden field bots fill in and people never see. */
var HONEYPOT_FIELD = "company_website";
var toValues = (formData) => {
	const values = {};
	for (const key of new Set(formData.keys())) {
		const entries = formData.getAll(key);
		values[key] = entries.length > 1 ? entries : entries[0];
	}
	return values;
};
var isRecord = (value) => typeof value === "object" && value !== null;
/** PocketBase answers a failed create with `response.data[field].message`. */
var fieldErrorsFrom = (error) => {
	const data = isRecord(error) && isRecord(error.response) ? error.response.data : null;
	if (!isRecord(data)) return {};
	return Object.fromEntries(Object.entries(data).filter((entry) => isRecord(entry[1]) && typeof entry[1].message === "string").map(([field, detail]) => [field, detail.message]));
};
/** 0 when the request never reached a server (offline, blocked). */
var statusFrom = (error) => isRecord(error) && typeof error.status === "number" ? error.status : 0;
var HONEYPOT_STYLE = {
	position: "absolute",
	left: "-10000px",
	width: "1px",
	height: "1px",
	overflow: "hidden"
};
/**
* Submit logic for any form — contact, quote, booking request, newsletter,
* RSVP. It owns sending, status and errors; the site owns every field, label,
* message and the layout.
*
*   // the public write-only collection the pocketbase skill describes
*   const form = useFormSubmission({ submit: (_values, data) => pb.collection('enquiries').create(data) });
*
*   <form onSubmit={form.onSubmit}>
*     <input {...form.honeypotProps} />
*     <input name="email" type="email" required aria-invalid={Boolean(form.fieldErrors.email)} />
*     {form.fieldErrors.email && <p>{form.fieldErrors.email}</p>}
*     <button disabled={form.isSubmitting}>…</button>
*     {form.isSuccess && <p>…thank-you copy in the site's language…</p>}
*   </form>
*
* A filled honeypot ends silently in `success` without sending anything.
* `errorStatus` (429 rate limited, 0 offline, …) lets the error copy say what to
* do next; write that copy yourself, in the site's language.
*/
function useFormSubmission({ submit, resetOnSuccess = true }) {
	const [status, setStatus] = useState("idle");
	const [fieldErrors, setFieldErrors] = useState({});
	const [errorStatus, setErrorStatus] = useState(null);
	const onSubmit = useCallback(async (event) => {
		event.preventDefault();
		const form = event.currentTarget;
		const formData = new FormData(form);
		const honeypot = formData.get(HONEYPOT_FIELD);
		formData.delete(HONEYPOT_FIELD);
		if (typeof honeypot === "string" && honeypot !== "") {
			setStatus("success");
			form.reset();
			return;
		}
		setStatus("submitting");
		setFieldErrors({});
		setErrorStatus(null);
		try {
			await submit(toValues(formData), formData);
			setStatus("success");
			if (resetOnSuccess) form.reset();
		} catch (error) {
			setFieldErrors(fieldErrorsFrom(error));
			setErrorStatus(statusFrom(error));
			setStatus("error");
		}
	}, [submit, resetOnSuccess]);
	const reset = useCallback(() => {
		setStatus("idle");
		setFieldErrors({});
		setErrorStatus(null);
	}, []);
	return {
		onSubmit,
		status,
		isSubmitting: status === "submitting",
		isSuccess: status === "success",
		isError: status === "error",
		fieldErrors,
		errorStatus,
		reset,
		honeypotProps: {
			name: HONEYPOT_FIELD,
			type: "text",
			tabIndex: -1,
			autoComplete: "off",
			"aria-hidden": true,
			style: HONEYPOT_STYLE
		}
	};
}
// src/components/home/contact.tsx
function Contact() {
	const form = useFormSubmission({ submit: (_values, data) => pocketbaseClient.collection("enquiries").create(data) });
	return /* @__PURE__ */ jsxs("section", {
		className: "contact section-wrap",
		id: "contact",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "contact-copy",
			children: [
				/* @__PURE__ */ jsx("div", {
					className: "section-number",
					children: "03 / LET’S MAKE IT HAPPEN"
				}),
				/* @__PURE__ */ jsxs("h2", { children: [
					"Your vision.",
					/* @__PURE__ */ jsx("br", {}),
					"Our sky."
				] }),
				/* @__PURE__ */ jsxs("p", { children: [
					"Have something extraordinary in mind?",
					/* @__PURE__ */ jsx("br", {}),
					"Tell us about it. We’ll take it from here."
				] }),
				/* @__PURE__ */ jsx("span", {
					className: "contact-marker",
					children: "THE NEXT GREAT SPECTACLE STARTS WITH A CONVERSATION."
				})
			]
		}), /* @__PURE__ */ jsxs("form", {
			onSubmit: form.onSubmit,
			className: "enquiry-form",
			children: [
				/* @__PURE__ */ jsx("input", { ...form.honeypotProps }),
				/* @__PURE__ */ jsx("div", {
					className: "form-row",
					children: [[
						"name",
						"Your name",
						"text"
					], [
						"email",
						"Email address",
						"email"
					]].map(([name, label, type]) => /* @__PURE__ */ jsxs("label", { children: [
						label,
						/* @__PURE__ */ jsx("input", {
							name,
							type,
							required: true,
							maxLength: name === "name" ? 150 : 254,
							placeholder: name === "name" ? "Full name" : "you@example.com",
							"aria-invalid": Boolean(form.fieldErrors[name])
						}),
						form.fieldErrors[name] && /* @__PURE__ */ jsx("span", {
							className: "field-error",
							children: form.fieldErrors[name]
						})
					] }, name))
				}),
				/* @__PURE__ */ jsxs("label", { children: [
					"Tell us about your vision",
					/* @__PURE__ */ jsx("textarea", {
						name: "message",
						rows: 4,
						required: true,
						minLength: 10,
						maxLength: 5e3,
						placeholder: "What would you like to bring to life? Share any details you have in mind.",
						"aria-invalid": Boolean(form.fieldErrors.message)
					}),
					form.fieldErrors.message && /* @__PURE__ */ jsx("span", {
						className: "field-error",
						children: form.fieldErrors.message
					})
				] }),
				/* @__PURE__ */ jsx("p", {
					className: "form-note",
					children: "Your details will only be used to respond to your enquiry."
				}),
				/* @__PURE__ */ jsxs("button", {
					className: "primary-button",
					disabled: form.isSubmitting,
					children: [form.isSubmitting ? "Sending enquiry…" : "Send an enquiry", /* @__PURE__ */ jsx(ArrowUpRight, { size: 18 })]
				}),
				/* @__PURE__ */ jsxs("div", {
					"aria-live": "polite",
					children: [form.isSuccess && /* @__PURE__ */ jsxs("p", {
						className: "success-message",
						children: [/* @__PURE__ */ jsx(Check, { size: 18 }), " Thank you. Your enquiry has been received."]
					}), form.isError && /* @__PURE__ */ jsx("p", {
						className: "field-error",
						children: "We couldn’t send your enquiry. Please check your details and try again."
					})]
				})
			]
		})]
	});
}
// src/hooks/use-disclosure.ts
/**
* Open/close behaviour for anything that shows and hides a panel: a mobile menu,
* a dropdown, a drawer, a modal-like overlay, a "read more". It carries no markup
* or styling; spread the props onto the elements the site designs.
*
*   const menu = useDisclosure({ lockScroll: true });
*   <button type="button" {...menu.triggerProps} aria-label="Menu">…</button>
*   {menu.isOpen && <nav {...menu.panelProps}>…</nav>}
*
* Escape closes it and returns focus to the trigger; navigating closes it by
* default. For a list of independently opening items (an FAQ), give each item
* its own `useDisclosure` or use a native `<details>`.
*/
function useDisclosure({ isInitiallyOpen = false, closeOnNavigate = true, closeOnEscape = true, lockScroll = false } = {}) {
	const [isOpen, setIsOpen] = useState(isInitiallyOpen);
	const panelId = useId();
	const triggerRef = useRef(null);
	const { pathname } = useLocation();
	const previousPathname = useRef(pathname);
	const open = useCallback(() => setIsOpen(true), []);
	const close = useCallback(() => setIsOpen(false), []);
	const toggle = useCallback(() => setIsOpen((current) => !current), []);
	const setTriggerRef = useCallback((node) => {
		triggerRef.current = node;
	}, []);
	useEffect(() => {
		if (previousPathname.current === pathname) return;
		previousPathname.current = pathname;
		if (closeOnNavigate) setIsOpen(false);
	}, [pathname, closeOnNavigate]);
	useEffect(() => {
		if (!isOpen || !closeOnEscape) return;
		const onKeyDown = (event) => {
			if (event.key !== "Escape") return;
			setIsOpen(false);
			triggerRef.current?.focus();
		};
		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	}, [isOpen, closeOnEscape]);
	useEffect(() => {
		if (!isOpen || !lockScroll) return;
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = previousOverflow;
		};
	}, [isOpen, lockScroll]);
	return {
		isOpen,
		open,
		close,
		toggle,
		triggerProps: {
			ref: setTriggerRef,
			onClick: toggle,
			"aria-expanded": isOpen,
			"aria-controls": panelId
		},
		panelProps: { id: panelId }
	};
}
// src/components/site-header.tsx
var navigation = [{
	href: "/team",
	label: "Team"
}, {
	href: "/showcase",
	label: "Showcase"
}];
function SiteHeader() {
	const menu = useDisclosure();
	return /* @__PURE__ */ jsxs("header", {
		className: "site-header",
		children: [
			/* @__PURE__ */ jsxs("a", {
				className: "brand",
				href: "/",
				"aria-label": "Sky Light Dynamics home",
				children: [
					/* @__PURE__ */ jsx(Sparkle, {
						size: 26,
						strokeWidth: 1.5
					}),
					" Sky Light Dynamics",
					/* @__PURE__ */ jsx("span", {
						className: "brand-dot",
						children: "®"
					})
				]
			}),
			/* @__PURE__ */ jsxs("nav", {
				className: "desktop-nav",
				"aria-label": "Main navigation",
				children: [navigation.map((item) => /* @__PURE__ */ jsx("a", {
					href: item.href,
					children: item.label
				}, item.href)), /* @__PURE__ */ jsxs("a", {
					href: "/#contact",
					className: "nav-contact",
					children: ["Let’s talk ", /* @__PURE__ */ jsx(ArrowUpRight, { size: 16 })]
				})]
			}),
			/* @__PURE__ */ jsx("button", {
				className: "menu-toggle",
				...menu.triggerProps,
				"aria-label": "Toggle navigation",
				children: menu.isOpen ? /* @__PURE__ */ jsx(X, {}) : /* @__PURE__ */ jsx(Menu, {})
			}),
			menu.isOpen && /* @__PURE__ */ jsx("nav", {
				className: "mobile-nav",
				...menu.panelProps,
				"aria-label": "Mobile navigation",
				children: [...navigation, {
					href: "/#contact",
					label: "Let’s talk"
				}].map((item) => /* @__PURE__ */ jsxs("a", {
					href: item.href,
					onClick: menu.close,
					children: [item.label, /* @__PURE__ */ jsx(ArrowUpRight, { size: 18 })]
				}, item.href))
			})
		]
	});
}
// src/components/site-footer.tsx
function SiteFooter() {
	return /* @__PURE__ */ jsxs("footer", {
		className: "site-footer",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "footer-top",
			children: [
				/* @__PURE__ */ jsxs("a", {
					href: "/",
					className: "brand",
					children: [/* @__PURE__ */ jsx(Sparkle, { size: 24 }), " Sky Light Dynamics"]
				}),
				/* @__PURE__ */ jsx("p", { children: "Extraordinary, by design." }),
				/* @__PURE__ */ jsxs("a", {
					href: "/#contact",
					children: ["Enquire about a performance ", /* @__PURE__ */ jsx(ArrowUpRight, { size: 16 })]
				})
			]
		}), /* @__PURE__ */ jsxs("div", {
			className: "footer-bottom",
			children: [
				/* @__PURE__ */ jsx("span", { children: "© 2026 Sky Light Dynamics. All rights reserved." }),
				/* @__PURE__ */ jsx("span", { children: "DRONE LIGHT PERFORMANCES" }),
				/* @__PURE__ */ jsx("button", {
					onClick: openCookiePreferences,
					children: "Cookie settings"
				})
			]
		})]
	});
}
// src/lib/logger.server.ts
var logger = {
	error: (...args) => {
		console.log("[ERROR]", ...args);
	},
	fatal: (...args) => {
		console.error("[FATAL]", ...args);
	},
	info: (...args) => {
		console.log("[INFO]", ...args);
	},
	debug: (...args) => {
		console.log("[DEBUG]", ...args);
	},
	warn: (...args) => {
		console.log("[WARN]", ...args);
	}
};
// src/lib/pocketbase-client.server.ts
var HEALTH_RETRIES = 10;
var HEALTH_RETRY_DELAY_MS = 1e3;
var SUPERUSERS_COLLECTION = "_superusers";
var pocketbaseUrl = () => process.env.POCKETBASE_URL || "http://localhost:8090";
var pb = new PocketBase(pocketbaseUrl());
pb.autoCancellation(false);
var authPromise = null;
var sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
var waitForHealth = async () => {
	for (let attempt = 1; attempt <= HEALTH_RETRIES; attempt += 1) {
		try {
			await pb.health.check();
			return;
		} catch {}
		logger.warn(`PocketBase not ready, retrying (${attempt}/${HEALTH_RETRIES})...`);
		await sleep(HEALTH_RETRY_DELAY_MS);
	}
	throw new Error(`PocketBase health check failed after ${HEALTH_RETRIES} retries`);
};
var authenticate = async () => {
	const identity = process.env.PB_SUPERUSER_EMAIL;
	const password = process.env.PB_SUPERUSER_PASSWORD;
	if (!identity || !password) throw new Error("PB_SUPERUSER_EMAIL / PB_SUPERUSER_PASSWORD are not set — is PocketBase enabled?");
	await waitForHealth();
	await pb.collection(SUPERUSERS_COLLECTION).authWithPassword(identity, password);
};
/** Authenticates once and reuses the token until `authStore` reports it expired. */
var ensureAuth = async () => {
	if (pb.authStore.isValid) return;
	if (!authPromise) authPromise = authenticate().finally(() => {
		authPromise = null;
	});
	return authPromise;
};
/** Re-authenticates once if PocketBase rejects a token it had previously accepted. */
var withFreshToken = async (request) => {
	await ensureAuth();
	try {
		return await request();
	} catch (error) {
		if (!(error instanceof ClientResponseError) || error.status !== 401) throw error;
		pb.authStore.clear();
		await ensureAuth();
		return request();
	}
};
var splitListQuery = ({ page, perPage, ...options }) => ({
	page: Number(page ?? 1),
	perPage: Number(perPage ?? 30),
	options
});
var pocketbaseAdmin = {
	/**
	* Builds a `filter` with values bound as parameters, e.g.
	* `filter('slug = {:slug}', { slug })`. Never interpolate request values into a
	* filter string: this client bypasses collection rules, so a crafted value could
	* query any record in any collection.
	*/
	filter: (expression, params) => pb.filter(expression, params),
	listRecords: (collection, query = {}) => {
		const { page, perPage, options } = splitListQuery(query);
		return withFreshToken(() => pb.collection(collection).getList(page, perPage, options));
	},
	getRecord: (collection, id, query = {}) => withFreshToken(() => pb.collection(collection).getOne(id, query)),
	createRecord: (collection, data) => withFreshToken(() => pb.collection(collection).create(data)),
	/** One transaction, so a failure part-way through leaves nothing written. */
	createRecords: async (collection, records) => {
		const batch = pb.createBatch();
		records.forEach((record) => batch.collection(collection).create(record));
		await withFreshToken(() => batch.send());
	},
	updateRecord: (collection, id, data) => withFreshToken(() => pb.collection(collection).update(id, data)),
	deleteRecord: async (collection, id) => {
		await withFreshToken(() => pb.collection(collection).delete(id));
	},
	/** Short-lived token that grants read access to files in protected collections. */
	getFileToken: () => withFreshToken(() => pb.files.getToken()),
	/**
	* Escape hatch for endpoints the SDK has no method for — a custom route added
	* with `routerAdd` in `apps/pocketbase/pb_hooks`. Everything PocketBase ships
	* itself is covered above or by the SDK; reach for those first.
	*/
	send: (path, init = {}) => withFreshToken(() => pb.send(path, init))
};
// src/routes/home.tsx
var home_exports = /* @__PURE__ */ __exportAll({
	default: () => home_default,
	loader: () => loader$6,
	meta: () => meta$3
});
async function loader$6() {
	let settings = { ...defaultSettings };
	let media = defaultMedia.map((m, i) => ({
		id: `default-${i}`,
		...m
	}));
	try {
		const res = await pocketbaseAdmin.listRecords("site_settings", { perPage: 1 });
		if (res.items.length > 0) {
			const s = res.items[0];
			settings = {
				opening_image: cmsImageUrl(s, "opening_image_file", "opening_image", defaultSettings.opening_image),
				opening_image_file: s.opening_image_file || "",
				opening_video: s.opening_video || "",
				hero_eyebrow: s.hero_eyebrow || defaultSettings.hero_eyebrow,
				hero_headline_1: s.hero_headline_1 || defaultSettings.hero_headline_1,
				hero_headline_2: s.hero_headline_2 || defaultSettings.hero_headline_2,
				hero_headline_3: s.hero_headline_3 || defaultSettings.hero_headline_3,
				hero_subtext: s.hero_subtext || defaultSettings.hero_subtext
			};
		}
	} catch {}
	try {
		const res = await pocketbaseAdmin.listRecords("performance_media", {
			filter: "published = true",
			sort: "sort_order",
			perPage: 60
		});
		if (res.items.length > 0) media = res.items.map(preparePerformanceItem);
	} catch {}
	return {
		settings,
		media
	};
}
function meta$3({ matches, location, loaderData }) {
	return seo({
		matches,
		location
	}, {
		title: "Sky Light Dynamics — Extraordinary Drone Light Performances",
		description: "Transform the night sky with Sky Light Dynamics. Discover professionally choreographed drone light performances and start a conversation about your vision.",
		image: loaderData?.settings.opening_image,
		jsonLd: [{
			"@context": "https://schema.org",
			"@type": "WebSite",
			name: "Sky Light Dynamics",
			description: "Professional drone light performances"
		}, {
			"@context": "https://schema.org",
			"@type": "Organization",
			name: "Sky Light Dynamics",
			description: "A professional provider of choreographed drone light performances."
		}]
	});
}
var home_default = UNSAFE_withComponentProps(function HomePage({ loaderData }) {
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx(SiteHeader, {}),
		/* @__PURE__ */ jsxs("main", { children: [
			/* @__PURE__ */ jsx(Hero, { settings: loaderData.settings }),
			/* @__PURE__ */ jsx(Experience, {}),
			/* @__PURE__ */ jsx(Showcase, { items: loaderData.media }),
			/* @__PURE__ */ jsx(Contact, {})
		] }),
		/* @__PURE__ */ jsx(SiteFooter, {})
	] });
});
// src/routes/team.tsx
var team_exports = /* @__PURE__ */ __exportAll({
	default: () => team_default,
	meta: () => meta$2
});
function meta$2({ matches, location }) {
	return seo({
		matches,
		location
	}, {
		title: "Team — Sky Light Dynamics",
		description: "Meet the creative, technical and production disciplines behind every Sky Light Dynamics performance."
	});
}
var disciplines = [
	{
		icon: Aperture,
		title: "Creative direction",
		copy: "Concept, story and choreography shaped into one unforgettable visual language."
	},
	{
		icon: Braces,
		title: "Technical design",
		copy: "Flight programming and precision systems that translate imagination into movement."
	},
	{
		icon: RadioTower,
		title: "Show operations",
		copy: "Planning, safety and live delivery considered carefully from the ground to the sky."
	}
];
var team_default = UNSAFE_withComponentProps(function TeamPage() {
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx(SiteHeader, {}),
		/* @__PURE__ */ jsxs("main", { children: [
			/* @__PURE__ */ jsxs("section", {
				className: "page-hero",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "eyebrow",
						children: [/* @__PURE__ */ jsx("span", { className: "status-dot" }), " THE TEAM"]
					}),
					/* @__PURE__ */ jsxs("h1", { children: [
						"The people behind",
						/* @__PURE__ */ jsx("br", {}),
						/* @__PURE__ */ jsx("span", { children: "the light." })
					] }),
					/* @__PURE__ */ jsx("p", { children: "Artists, technologists and operators working as one to create experiences that move people." })
				]
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "team-disciplines section-wrap",
				"aria-label": "Team disciplines",
				children: [/* @__PURE__ */ jsx("div", {
					className: "section-number",
					children: "ONE TEAM / EVERY DETAIL"
				}), /* @__PURE__ */ jsx("div", {
					className: "discipline-grid",
					children: disciplines.map(({ icon: Icon, title, copy }, index) => /* @__PURE__ */ jsxs("article", { children: [
						/* @__PURE__ */ jsxs("span", {
							className: "discipline-index",
							children: ["0", index + 1]
						}),
						/* @__PURE__ */ jsx(Icon, {
							size: 28,
							strokeWidth: 1.2
						}),
						/* @__PURE__ */ jsx("h2", { children: title }),
						/* @__PURE__ */ jsx("p", { children: copy })
					] }, title))
				})]
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "page-cta section-wrap",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
					className: "section-number",
					children: "START A CONVERSATION"
				}), /* @__PURE__ */ jsx("h2", { children: "Bring us your vision." })] }), /* @__PURE__ */ jsx("a", {
					className: "primary-button",
					href: "/#contact",
					children: "Let’s talk"
				})]
			})
		] }),
		/* @__PURE__ */ jsx(SiteFooter, {})
	] });
});
// src/data/articles.ts
var defaultArticles = [
	{
		id: "default-urban-skies",
		title: "Designing for urban night skies",
		slug: "designing-for-urban-night-skies",
		category: "Research",
		excerpt: "How scale, viewing distance and the character of a place shape a drone-light composition.",
		body: `<p>A city skyline is never a blank canvas. Buildings, ambient light and the movement of an audience all influence how a formation is perceived.</p><h2>Design begins with the place</h2><p>We study sightlines, scale and visual rhythm before choreography begins. The goal is not simply to place an image in the sky, but to create a composition that belongs to its setting.</p><h2>Clarity at a distance</h2><p>Strong silhouettes, controlled transitions and considered pacing help an idea remain legible across a large viewing area. Every movement has to support the story as well as the technical environment.</p>`,
		coverImage: defaultMedia[0].image,
		cover_image_url: defaultMedia[0].image,
		published_at: "2026-10-15 12:00:00.000Z",
		featured: true
	},
	{
		id: "default-brand-storytelling",
		title: "Brand storytelling at monumental scale",
		slug: "brand-storytelling-at-monumental-scale",
		category: "Commercial ideas",
		excerpt: "Turning a campaign thought into a public moment people can experience and share together.",
		body: `<p>Drone light offers brands something rare: a message can become an event, experienced collectively rather than simply viewed on a screen.</p><h2>More than a logo reveal</h2><p>The strongest branded performances build anticipation, create transformation and earn the final image. Narrative gives the audience a reason to stay with the story.</p><h2>Designed to travel</h2><p>A live spectacle can also become a rich source of campaign material. Camera positions, key formations and timing can be planned for both the audience on site and the viewers who discover it later.</p>`,
		coverImage: defaultMedia[1].image,
		cover_image_url: defaultMedia[1].image,
		published_at: "2026-09-22 12:00:00.000Z"
	},
	{
		id: "default-shared-memory",
		title: "From festival moment to shared memory",
		slug: "from-festival-moment-to-shared-memory",
		category: "Commercial ideas",
		excerpt: "Why collective attention, pacing and a sense of place matter when designing for live audiences.",
		body: `<p>At a festival or civic celebration, the audience arrives with different expectations but looks up at the same sky. That shared point of focus is the beginning of a memorable experience.</p><h2>Build a collective rhythm</h2><p>Quiet passages make scale feel larger. Surprising transitions create energy. A carefully structured sequence gives a crowd time to notice, react and anticipate together.</p><h2>Leave room for wonder</h2><p>Technology makes the performance possible, but emotion is what remains. Our research asks how each technical choice can make the final experience feel more human.</p>`,
		coverImage: defaultMedia[0].image,
		cover_image_url: defaultMedia[0].image,
		published_at: "2026-08-30 12:00:00.000Z"
	}
];
function prepareArticle(article) {
	return {
		...article,
		coverImage: cmsImageUrl(article, "cover_image", "cover_image_url", article.coverImage || "")
	};
}
// src/lib/intl-format.ts
var toDate = (value) => value instanceof Date ? value : new Date(value);
/** The caller's own parts (`month`, `weekday`, …) win; a style is only the fallback for none. */
var dateFormatter = ({ locale, timeZone = "UTC", ...options }, fallback) => new Intl.DateTimeFormat(locale, {
	timeZone,
	...Object.keys(options).length ? options : fallback
});
/** `formatDate('2026-05-01', { locale: 'en' })` → `"May 1, 2026"` */
var formatDate = (value, options) => dateFormatter(options, { dateStyle: "long" }).format(toDate(value));
// src/routes/showcase.tsx
var showcase_exports = /* @__PURE__ */ __exportAll({
	default: () => showcase_default,
	loader: () => loader$5,
	meta: () => meta$1
});
async function loader$5() {
	let media = defaultMedia.map((item, index) => ({
		id: `default-${index}`,
		...item
	}));
	let articles = defaultArticles;
	try {
		const response = await pocketbaseAdmin.listRecords("performance_media", {
			filter: "published = true",
			sort: "sort_order",
			perPage: 60
		});
		if (response.items.length > 0) media = response.items.map(preparePerformanceItem);
	} catch {}
	try {
		const response = await pocketbaseAdmin.listRecords("articles", {
			filter: "published = true",
			sort: "-featured,-published_at",
			perPage: 60
		});
		if (response.items.length > 0) articles = response.items.map(prepareArticle);
	} catch {}
	return {
		media,
		articles
	};
}
function meta$1({ matches, location }) {
	return seo({
		matches,
		location
	}, {
		title: "Showcase — Sky Light Dynamics",
		description: "Explore the scale, movement and visual possibilities of Sky Light Dynamics drone light performances.",
		image: defaultMedia[0]?.image
	});
}
var showcase_default = UNSAFE_withComponentProps(function ShowcasePage({ loaderData }) {
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx(SiteHeader, {}),
		/* @__PURE__ */ jsxs("main", {
			className: "showcase-page",
			children: [
				/* @__PURE__ */ jsxs("section", {
					className: "page-hero",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "eyebrow",
							children: [/* @__PURE__ */ jsx("span", { className: "status-dot" }), " SELECTED WORK"]
						}),
						/* @__PURE__ */ jsxs("h1", { children: [
							"Ideas written",
							/* @__PURE__ */ jsx("br", {}),
							/* @__PURE__ */ jsx("span", { children: "in light." })
						] }),
						/* @__PURE__ */ jsx("p", { children: "A closer look at the forms, scale and emotion possible in the night sky." })
					]
				}),
				/* @__PURE__ */ jsx(Showcase, { items: loaderData.media }),
				/* @__PURE__ */ jsxs("section", {
					className: "article-index section-wrap",
					"aria-labelledby": "article-index-title",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "article-index-heading",
						children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
							className: "section-number",
							children: "IDEAS / RESEARCH"
						}), /* @__PURE__ */ jsxs("h2", {
							id: "article-index-title",
							children: [
								"Notes from",
								/* @__PURE__ */ jsx("br", {}),
								/* @__PURE__ */ jsx("span", { children: "the studio." })
							]
						})] }), /* @__PURE__ */ jsx("p", { children: "Research, observations and commercial possibilities for the sky above us." })]
					}), /* @__PURE__ */ jsx("div", {
						className: "article-grid",
						children: loaderData.articles.map((article) => /* @__PURE__ */ jsxs("article", {
							className: "article-card",
							children: [
								/* @__PURE__ */ jsx("a", {
									href: `/showcase/${article.slug}`,
									className: "article-card-image",
									children: /* @__PURE__ */ jsx("img", {
										src: article.coverImage,
										alt: "",
										loading: "lazy"
									})
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "article-card-meta",
									children: [/* @__PURE__ */ jsx("span", { children: article.category }), /* @__PURE__ */ jsx("time", {
										dateTime: article.published_at,
										children: formatDate(article.published_at.slice(0, 10), {
											locale: "en",
											month: "short",
											year: "numeric"
										})
									})]
								}),
								/* @__PURE__ */ jsx("h3", { children: /* @__PURE__ */ jsx("a", {
									href: `/showcase/${article.slug}`,
									children: article.title
								}) }),
								/* @__PURE__ */ jsx("p", { children: article.excerpt }),
								/* @__PURE__ */ jsxs("a", {
									className: "article-read",
									href: `/showcase/${article.slug}`,
									children: ["Read article ", /* @__PURE__ */ jsx(ArrowUpRight, { size: 16 })]
								})
							]
						}, article.slug))
					})]
				})
			]
		}),
		/* @__PURE__ */ jsx(SiteFooter, {})
	] });
});
// src/routes/article.tsx
var article_exports = /* @__PURE__ */ __exportAll({
	default: () => article_default,
	loader: () => loader$4,
	meta: () => meta
});
async function loader$4({ params }) {
	const fallback = defaultArticles.find((article) => article.slug === params.slug);
	try {
		const filter = pocketbaseAdmin.filter("slug = {:slug} && published = true", { slug: params.slug });
		const response = await pocketbaseAdmin.listRecords("articles", {
			filter,
			perPage: 1
		});
		if (response.items[0]) return { article: prepareArticle(response.items[0]) };
	} catch {}
	if (fallback) return { article: fallback };
	throw new Response("Article not found", { status: 404 });
}
function meta({ matches, location, loaderData }) {
	const article = loaderData?.article;
	return seo({
		matches,
		location
	}, {
		title: article ? `${article.title} — Sky Light Dynamics` : "Article — Sky Light Dynamics",
		description: article?.excerpt || "Ideas and research from Sky Light Dynamics.",
		image: article?.coverImage,
		type: "article",
		jsonLd: article ? {
			"@context": "https://schema.org",
			"@type": "Article",
			headline: article.title,
			datePublished: article.published_at,
			image: article.coverImage,
			publisher: {
				"@type": "Organization",
				name: "Sky Light Dynamics"
			}
		} : void 0
	});
}
var article_default = UNSAFE_withComponentProps(function ArticlePage({ loaderData }) {
	const { article } = loaderData;
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx(SiteHeader, {}),
		/* @__PURE__ */ jsx("main", { children: /* @__PURE__ */ jsxs("article", {
			className: "article-page",
			children: [
				/* @__PURE__ */ jsxs("header", {
					className: "article-hero",
					children: [
						/* @__PURE__ */ jsxs("a", {
							href: "/showcase",
							className: "article-back",
							children: [/* @__PURE__ */ jsx(ArrowLeft, { size: 15 }), " Back to Showcase"]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "article-kicker",
							children: [/* @__PURE__ */ jsx("span", { children: article.category }), /* @__PURE__ */ jsx("time", {
								dateTime: article.published_at,
								children: formatDate(article.published_at.slice(0, 10), { locale: "en" })
							})]
						}),
						/* @__PURE__ */ jsx("h1", { children: article.title }),
						/* @__PURE__ */ jsx("p", { children: article.excerpt })
					]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "article-cover",
					children: /* @__PURE__ */ jsx("img", {
						src: article.coverImage,
						alt: ""
					})
				}),
				/* @__PURE__ */ jsx("div", {
					className: "article-body",
					dangerouslySetInnerHTML: { __html: article.body }
				})
			]
		}) }),
		/* @__PURE__ */ jsx(SiteFooter, {})
	] });
});
// src/routes/sitemap.xml.ts
var sitemap_xml_exports = /* @__PURE__ */ __exportAll({ loader: () => loader$3 });
var STATIC_PATHS = [
	"/",
	"/team",
	"/showcase"
];
function escapeXml(value) {
	return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&apos;");
}
function toLoc(origin, path) {
	return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}
function serializeSitemap(origin, entries) {
	return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.map((entry) => {
		return `\t<url>\n\t\t<loc>${escapeXml(toLoc(origin, entry.path))}</loc>${entry.lastmod ? `\n\t\t<lastmod>${escapeXml(entry.lastmod)}</lastmod>` : ""}\n\t</url>`;
	}).join("\n")}\n</urlset>\n`;
}
/**
* Public dynamic URLs (blog posts, PDPs, articles).
* Return `{ path, lastmod }` in the same change that adds a collection.
* Return `[]` only while the site has no public records; clear those URLs
* again in the same change that removes the collection.
*/
async function getDynamicEntries() {
	try {
		const response = await pocketbaseAdmin.listRecords("articles", {
			filter: "published = true",
			fields: "slug,updated",
			perPage: 200
		});
		if (response.items.length > 0) return response.items.map((article) => ({
			path: `/showcase/${article.slug}`,
			...article.updated && { lastmod: article.updated.slice(0, 10) }
		}));
	} catch {}
	return defaultArticles.map((article) => ({ path: `/showcase/${article.slug}` }));
}
async function loader$3({ request }) {
	const origin = siteOrigin(request);
	const entries = [...STATIC_PATHS.map((path) => ({ path })), ...await getDynamicEntries()];
	return new Response(serializeSitemap(origin, entries), { headers: {
		"Content-Type": "application/xml; charset=utf-8",
		"Cache-Control": "public, max-age=3600",
		"Access-Control-Allow-Origin": "*"
	} });
}
// src/routes/robots.txt.ts
var robots_txt_exports = /* @__PURE__ */ __exportAll({ loader: () => loader$2 });
/**
* Hostinger-provided hosts: the editor sandbox preview, and the domain a site is
* published on before its owner connects one of their own. Neither should reach a
* search index — the site is not on its final URL yet.
*/
var UNPUBLISHED_HOST_SUFFIXES = [
	".app-preview.com",
	".app-preview.io",
	".hostingersite.com",
	".hostingersite.dev"
];
/**
* The assistants and answer engines that fetch a page to answer someone's
* question and cite the site back. They are listed by name, rather than left to
* the wildcard group, so the site's stance on AI access is explicit to anyone —
* or anything — reading the file.
*
* Each vendor splits the work the same way: one crawler builds the index the
* answers are drawn from, another fetches the single page a person just asked
* about. Meta and Amazon both document that second kind as free to skip
* robots.txt, since a human asked for the page — naming them records the site's
* answer, it does not enforce it.
*/
var AI_ANSWER_AGENTS = [
	"OAI-SearchBot",
	"ChatGPT-User",
	"Claude-SearchBot",
	"Claude-User",
	"PerplexityBot",
	"Perplexity-User",
	"DuckAssistBot",
	"MistralAI-User",
	"meta-webindexer",
	"meta-externalfetcher",
	"Amzn-SearchBot",
	"Amzn-User"
];
/**
* Tokens whose meaning is permission to train generative models on the content.
* `Google-Extended` and `Applebot-Extended` are not crawlers and never fetch
* anything — they read robots.txt as a usage licence, so `Disallow: /` is the
* only way to express `ai-train=no` to them. The rest are the crawlers that
* collect training corpora. Most have an answer-engine counterpart above that
* keeps the site citable in exchange; `Bytespider` is last because ByteDance
* runs no answer engine to trade the access for.
*
* Blocking `Google-Extended` also gives up grounding in the Gemini app. Google
* Search, and the AI Overviews built from its index, are unaffected, and
* `Applebot-Extended` works the same way for Siri and Spotlight. `Googlebot`
* and `Applebot` themselves keep their access through the wildcard group, which
* is why neither is named above.
*/
var AI_TRAINING_AGENTS = [
	"GPTBot",
	"ClaudeBot",
	"Google-Extended",
	"Applebot-Extended",
	"meta-externalagent",
	"Amazonbot",
	"Bytespider"
];
/**
* Content signals (contentsignals.org) state what crawlers may do with the
* content once fetched: appear in search results, ground an AI answer, or train
* a model. Search and AI answers are allowed because they bring readers back;
* training is not, which is the default every publisher starts from.
*
* A named group replaces the wildcard group for that agent rather than adding
* to it, so the signal is repeated inside each one — otherwise the agents it is
* aimed at are the only ones that never read it.
*/
var CONTENT_SIGNAL = "Content-Signal: search=yes, ai-input=yes, ai-train=no";
function publishedRules(origin) {
	return [
		"User-agent: *",
		CONTENT_SIGNAL,
		"Allow: /",
		"",
		...AI_ANSWER_AGENTS.flatMap((agent) => [
			`User-agent: ${agent}`,
			CONTENT_SIGNAL,
			"Allow: /",
			""
		]),
		...AI_TRAINING_AGENTS.flatMap((agent) => [
			`User-agent: ${agent}`,
			"Disallow: /",
			""
		]),
		`Sitemap: ${origin}/sitemap.xml`
	];
}
function loader$2({ request }) {
	const origin = siteOrigin(request);
	const { hostname } = new URL(origin);
	const lines = UNPUBLISHED_HOST_SUFFIXES.some((suffix) => hostname.endsWith(suffix)) ? ["User-agent: *", "Disallow: /"] : publishedRules(origin);
	return new Response(`${lines.join("\n")}\n`, { headers: {
		"Content-Type": "text/plain; charset=utf-8",
		"Cache-Control": "public, max-age=3600"
	} });
}
// src/lib/rate-limit.server.ts
/**
* Fixed-window rate limiter for `/api/*` resource routes.
*
* Counters live in this server process only. Never apply this to page routes —
* a single page load fans out into many requests and would exhaust the window
* immediately.
*
* `rate-limiter-flexible` does the counting and `ipaddr.js` parses the address.
* What is left here is deciding which caller a request belongs to: the left-most
* `X-Forwarded-For` entry, with IPv6 grouped by /56 so a caller cannot rotate
* addresses for a fresh window.
*/
var MS_PER_SECOND = 1e3;
var WINDOW_SECONDS = 300;
var MAX_REQUESTS_PER_WINDOW = 100;
/** 7 bytes of a 16-byte address make up the /56 prefix. */
var IPV6_PREFIX_BYTES = 7;
/**
* The proxy in front of this server rewrites `X-Forwarded-For`, so the left-most
* entry is the real client. Direct requests (no proxy) share the `unknown` bucket.
*/
var clientIdentifier = (request) => {
	const [forwarded] = request.headers.get("x-forwarded-for")?.split(",") ?? [];
	const address = forwarded?.trim() || request.headers.get("x-real-ip")?.trim();
	if (!address) return "unknown";
	try {
		const parsed = ipaddr.parse(address);
		if (!(parsed instanceof ipaddr.IPv6)) return address;
		if (parsed.isIPv4MappedAddress()) return parsed.toIPv4Address().toString();
		return parsed.toByteArray().slice(0, IPV6_PREFIX_BYTES).join(".");
	} catch {
		return address;
	}
};
var sharedLimiter = new RateLimiterMemory({
	points: MAX_REQUESTS_PER_WINDOW,
	duration: WINDOW_SECONDS
});
/**
* Spending the budget rejects with the same result object a success resolves
* with; anything else is the store failing and must not pass as a verdict.
*/
var consume = async (limiter, identifier) => {
	try {
		return {
			result: await limiter.consume(identifier),
			isLimited: false
		};
	} catch (error) {
		if (error instanceof RateLimiterRes) return {
			result: error,
			isLimited: true
		};
		throw error;
	}
};
var consumeRateLimit = async (identifier) => {
	const { result, isLimited } = await consume(sharedLimiter, identifier);
	return {
		isLimited,
		limit: MAX_REQUESTS_PER_WINDOW,
		remaining: result.remainingPoints,
		resetSeconds: Math.max(0, Math.ceil(result.msBeforeNext / MS_PER_SECOND))
	};
};
/** IETF draft `RateLimit-*` headers. */
var rateLimitHeaders = (verdict) => {
	const headers = {
		"RateLimit-Policy": `${verdict.limit};w=${WINDOW_SECONDS}`,
		"RateLimit-Limit": String(verdict.limit),
		"RateLimit-Remaining": String(verdict.remaining),
		"RateLimit-Reset": String(verdict.resetSeconds)
	};
	if (verdict.isLimited) headers["Retry-After"] = String(verdict.resetSeconds);
	return headers;
};
// src/lib/api.server.ts
/**
* Helpers for `/api/*` resource routes: JSON responses, security headers,
* rate limiting, body-size limits, and a single error shape.
*
* Wrap every resource route handler in `withApi`: there is no global middleware
* in this app, so the wrapper is what applies these concerns to a route.
*/
/**
* Applied to API responses only. Page responses must stay untouched, because
* framing and CSP headers break embedding the site in a preview iframe.
* Transport security (HSTS) belongs to the proxy in front of this server.
*
* `Cache-Control: no-store` is defence in depth, not a guarantee: the platform
* edge cache rewrites this header on published domains and caches `/api/*` GET
* responses by URL for all visitors. Per-user or authenticated endpoints must
* therefore be actions (POST) — never GET. Handlers returning public,
* cache-friendly data may override by setting their own Cache-Control
* (existing headers are never overwritten here).
*/
var SECURITY_HEADERS = {
	"Cache-Control": "no-store",
	"Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
	"Cross-Origin-Resource-Policy": "same-origin",
	"Referrer-Policy": "no-referrer",
	"X-Content-Type-Options": "nosniff",
	"X-Frame-Options": "DENY",
	"X-Permitted-Cross-Domain-Policies": "none"
};
var withExtraHeaders = (response, extra) => {
	const headers = new Headers(response.headers);
	for (const [name, value] of Object.entries(extra)) if (!headers.has(name)) headers.set(name, value);
	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers
	});
};
/** JSON response carrying the API security headers. */
var json = (value, init = {}) => withExtraHeaders(Response.json(value, init), SECURITY_HEADERS);
/** Client-error response — use for input validation, never for server failures. */
var apiError = (status, message) => json({ error: message }, { status });
var serverError = (error) => {
	const isProduction = process.env.NODE_ENV === "production";
	const cause = error instanceof Error ? error : new Error(String(error));
	return json({
		message: "Something went wrong!",
		...!isProduction && { error: {
			name: cause.name,
			message: cause.message,
			stack: cause.stack
		} }
	}, { status: 500 });
};
var runHandler = async (handler, args) => {
	const verdict = await consumeRateLimit(clientIdentifier(args.request));
	if (verdict.isLimited) return withExtraHeaders(apiError(429, "Too many requests, please try again later"), rateLimitHeaders(verdict));
	const extraHeaders = rateLimitHeaders(verdict);
	try {
		const result = await handler(args);
		return withExtraHeaders(result instanceof Response ? withExtraHeaders(result, SECURITY_HEADERS) : json(result ?? null), extraHeaders);
	} catch (error) {
		if (error instanceof Response) return withExtraHeaders(error, extraHeaders);
		logger.error(error instanceof Error ? error.message : error, error instanceof Error ? error.stack : void 0);
		return withExtraHeaders(serverError(error), extraHeaders);
	}
};
/**
* Wraps a resource route `loader` / `action`. Rate limits the caller, adds
* security headers, logs the request, and turns any thrown error into the shared
* 500 shape — so handlers can `throw new Error(...)` instead of building error
* responses.
*/
var withApi = (handler) => {
	return async (args) => {
		const startedAt = Date.now();
		const response = await runHandler(handler, args);
		const { pathname } = new URL(args.request.url);
		logger.info(`${args.request.method} ${pathname} ${response.status} ${Date.now() - startedAt}ms`);
		return response;
	};
};
// src/routes/api.health.ts
var api_health_exports = /* @__PURE__ */ __exportAll({ loader: () => loader$1 });
var loader$1 = withApi(async () => json({ ok: true }));
// src/routes/api.$.ts
var api_$_exports = /* @__PURE__ */ __exportAll({
	action: () => action,
	loader: () => loader
});
/**
* Unmatched `/api/*` paths answer with JSON instead of React Router's HTML
* error document. More specific `/api/...` routes always win over this one.
*/
var notFound = withApi(async () => apiError(404, "Route not found"));
var loader = notFound;
var action = notFound;
// \0virtual:react-router/server-manifest
var server_manifest_default = {
	"entry": {
		"module": "/assets/entry.client-FdnSZSfJ.js",
		"imports": ["/assets/jsx-runtime-B3JqzSDr.js", "/assets/_virtual_horizons-runtime-BxAtCBaI.js"],
		"css": []
	},
	"routes": {
		"root": {
			"id": "root",
			"parentId": void 0,
			"path": "",
			"index": void 0,
			"caseSensitive": void 0,
			"hasAction": false,
			"hasLoader": true,
			"hasClientAction": false,
			"hasClientLoader": false,
			"hasClientMiddleware": false,
			"hasDefaultExport": true,
			"hasErrorBoundary": true,
			"module": "/assets/root-BSdln8mj.js",
			"imports": [
				"/assets/jsx-runtime-B3JqzSDr.js",
				"/assets/_virtual_horizons-runtime-BxAtCBaI.js",
				"/assets/cookie-consent-DHKCDv4m.js"
			],
			"css": [],
			"clientActionModule": void 0,
			"clientLoaderModule": void 0,
			"clientMiddlewareModule": void 0,
			"hydrateFallbackModule": void 0
		},
		"routes/home": {
			"id": "routes/home",
			"parentId": "root",
			"path": void 0,
			"index": true,
			"caseSensitive": void 0,
			"hasAction": false,
			"hasLoader": true,
			"hasClientAction": false,
			"hasClientLoader": false,
			"hasClientMiddleware": false,
			"hasDefaultExport": true,
			"hasErrorBoundary": false,
			"module": "/assets/home-BPQRNRtQ.js",
			"imports": [
				"/assets/jsx-runtime-B3JqzSDr.js",
				"/assets/site-footer-vqyi5I7r.js",
				"/assets/showcase-Cou5jI13.js",
				"/assets/cookie-consent-DHKCDv4m.js"
			],
			"css": [],
			"clientActionModule": void 0,
			"clientLoaderModule": void 0,
			"clientMiddlewareModule": void 0,
			"hydrateFallbackModule": void 0
		},
		"routes/team": {
			"id": "routes/team",
			"parentId": "root",
			"path": "team",
			"index": void 0,
			"caseSensitive": void 0,
			"hasAction": false,
			"hasLoader": false,
			"hasClientAction": false,
			"hasClientLoader": false,
			"hasClientMiddleware": false,
			"hasDefaultExport": true,
			"hasErrorBoundary": false,
			"module": "/assets/team-CqvsOmzA.js",
			"imports": [
				"/assets/jsx-runtime-B3JqzSDr.js",
				"/assets/site-footer-vqyi5I7r.js",
				"/assets/cookie-consent-DHKCDv4m.js"
			],
			"css": [],
			"clientActionModule": void 0,
			"clientLoaderModule": void 0,
			"clientMiddlewareModule": void 0,
			"hydrateFallbackModule": void 0
		},
		"routes/showcase": {
			"id": "routes/showcase",
			"parentId": "root",
			"path": "showcase",
			"index": void 0,
			"caseSensitive": void 0,
			"hasAction": false,
			"hasLoader": true,
			"hasClientAction": false,
			"hasClientLoader": false,
			"hasClientMiddleware": false,
			"hasDefaultExport": true,
			"hasErrorBoundary": false,
			"module": "/assets/showcase-KCnXOKjj.js",
			"imports": [
				"/assets/jsx-runtime-B3JqzSDr.js",
				"/assets/site-footer-vqyi5I7r.js",
				"/assets/showcase-Cou5jI13.js",
				"/assets/intl-format-CiWBrDCR.js",
				"/assets/cookie-consent-DHKCDv4m.js"
			],
			"css": [],
			"clientActionModule": void 0,
			"clientLoaderModule": void 0,
			"clientMiddlewareModule": void 0,
			"hydrateFallbackModule": void 0
		},
		"routes/article": {
			"id": "routes/article",
			"parentId": "root",
			"path": "showcase/:slug",
			"index": void 0,
			"caseSensitive": void 0,
			"hasAction": false,
			"hasLoader": true,
			"hasClientAction": false,
			"hasClientLoader": false,
			"hasClientMiddleware": false,
			"hasDefaultExport": true,
			"hasErrorBoundary": false,
			"module": "/assets/article-Dmb4o5xr.js",
			"imports": [
				"/assets/jsx-runtime-B3JqzSDr.js",
				"/assets/site-footer-vqyi5I7r.js",
				"/assets/intl-format-CiWBrDCR.js",
				"/assets/cookie-consent-DHKCDv4m.js"
			],
			"css": [],
			"clientActionModule": void 0,
			"clientLoaderModule": void 0,
			"clientMiddlewareModule": void 0,
			"hydrateFallbackModule": void 0
		},
		"routes/sitemap.xml": {
			"id": "routes/sitemap.xml",
			"parentId": "root",
			"path": "sitemap.xml",
			"index": void 0,
			"caseSensitive": void 0,
			"hasAction": false,
			"hasLoader": true,
			"hasClientAction": false,
			"hasClientLoader": false,
			"hasClientMiddleware": false,
			"hasDefaultExport": false,
			"hasErrorBoundary": false,
			"module": "/assets/sitemap.xml-BvRk9kiK.js",
			"imports": [],
			"css": [],
			"clientActionModule": void 0,
			"clientLoaderModule": void 0,
			"clientMiddlewareModule": void 0,
			"hydrateFallbackModule": void 0
		},
		"routes/robots.txt": {
			"id": "routes/robots.txt",
			"parentId": "root",
			"path": "robots.txt",
			"index": void 0,
			"caseSensitive": void 0,
			"hasAction": false,
			"hasLoader": true,
			"hasClientAction": false,
			"hasClientLoader": false,
			"hasClientMiddleware": false,
			"hasDefaultExport": false,
			"hasErrorBoundary": false,
			"module": "/assets/robots.txt-BvRk9kiK.js",
			"imports": [],
			"css": [],
			"clientActionModule": void 0,
			"clientLoaderModule": void 0,
			"clientMiddlewareModule": void 0,
			"hydrateFallbackModule": void 0
		},
		"routes/api.health": {
			"id": "routes/api.health",
			"parentId": "root",
			"path": "api/health",
			"index": void 0,
			"caseSensitive": void 0,
			"hasAction": false,
			"hasLoader": true,
			"hasClientAction": false,
			"hasClientLoader": false,
			"hasClientMiddleware": false,
			"hasDefaultExport": false,
			"hasErrorBoundary": false,
			"module": "/assets/api.health-BvRk9kiK.js",
			"imports": [],
			"css": [],
			"clientActionModule": void 0,
			"clientLoaderModule": void 0,
			"clientMiddlewareModule": void 0,
			"hydrateFallbackModule": void 0
		},
		"routes/api.$": {
			"id": "routes/api.$",
			"parentId": "root",
			"path": "api/*",
			"index": void 0,
			"caseSensitive": void 0,
			"hasAction": true,
			"hasLoader": true,
			"hasClientAction": false,
			"hasClientLoader": false,
			"hasClientMiddleware": false,
			"hasDefaultExport": false,
			"hasErrorBoundary": false,
			"module": "/assets/api._-BvRk9kiK.js",
			"imports": [],
			"css": [],
			"clientActionModule": void 0,
			"clientLoaderModule": void 0,
			"clientMiddlewareModule": void 0,
			"hydrateFallbackModule": void 0
		}
	},
	"url": "/assets/manifest-d9b61147.js",
	"version": "d9b61147",
	"sri": void 0
};
// \0virtual:react-router/server-build
var assetsBuildDirectory = "../../dist/apps/web/client";
var basename = "/";
var future = {
	"unstable_customRouteDiscovery": false,
	"unstable_enableNodeReadableStream": false,
	"unstable_optimizeDeps": false
};
var ssr = true;
var unstable_apiOnly = false;
var unstable_apiServerOrigin = void 0;
var isSpaMode = false;
var prerender = [];
var routeDiscovery = {
	"mode": "lazy",
	"manifestPath": "/__manifest"
};
var publicPath = "/";
var entry = { module: entry_server_exports };
var routes = {
	"root": {
		id: "root",
		parentId: void 0,
		path: "",
		index: void 0,
		caseSensitive: void 0,
		module: root_exports
	},
	"routes/home": {
		id: "routes/home",
		parentId: "root",
		path: void 0,
		index: true,
		caseSensitive: void 0,
		module: home_exports
	},
	"routes/team": {
		id: "routes/team",
		parentId: "root",
		path: "team",
		index: void 0,
		caseSensitive: void 0,
		module: team_exports
	},
	"routes/showcase": {
		id: "routes/showcase",
		parentId: "root",
		path: "showcase",
		index: void 0,
		caseSensitive: void 0,
		module: showcase_exports
	},
	"routes/article": {
		id: "routes/article",
		parentId: "root",
		path: "showcase/:slug",
		index: void 0,
		caseSensitive: void 0,
		module: article_exports
	},
	"routes/sitemap.xml": {
		id: "routes/sitemap.xml",
		parentId: "root",
		path: "sitemap.xml",
		index: void 0,
		caseSensitive: void 0,
		module: sitemap_xml_exports
	},
	"routes/robots.txt": {
		id: "routes/robots.txt",
		parentId: "root",
		path: "robots.txt",
		index: void 0,
		caseSensitive: void 0,
		module: robots_txt_exports
	},
	"routes/api.health": {
		id: "routes/api.health",
		parentId: "root",
		path: "api/health",
		index: void 0,
		caseSensitive: void 0,
		module: api_health_exports
	},
	"routes/api.$": {
		id: "routes/api.$",
		parentId: "root",
		path: "api/*",
		index: void 0,
		caseSensitive: void 0,
		module: api_$_exports
	}
};
var allowedActionOrigins = false;
export { allowedActionOrigins, server_manifest_default as assets, assetsBuildDirectory, basename, entry, future, isSpaMode, prerender, publicPath, routeDiscovery, routes, ssr, unstable_apiOnly, unstable_apiServerOrigin };
