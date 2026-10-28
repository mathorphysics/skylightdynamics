// \0virtual:horizons-runtime
function resolveFetchUrl(input) {
	if (typeof input === "string") return input;
	if (input instanceof URL) return input.href;
	if (input && typeof input.url === "string") return input.url;
	return String(input ?? "");
}
var STACK_FRAME_LINE_REGEX = /^\s*at\s/;
var WORKSPACE_STACK_FRAME_REGEX = /.*\/apps\/web\/(src\/[^\s):]+:\d+:\d+)/;
var APP_STACK_FRAME_REGEX = /\/(src\/[^\s):]+:\d+:\d+)/;
var MAX_APP_STACK_FRAMES = 4;
function appFrameLocation(line) {
	if (!STACK_FRAME_LINE_REGEX.test(line) || line.includes("/node_modules/")) return null;
	const match = line.match(WORKSPACE_STACK_FRAME_REGEX) ?? line.match(APP_STACK_FRAME_REGEX);
	return match ? match[1] : null;
}
function appStackFrames(stack) {
	if (typeof stack !== "string") return [];
	const frames = [];
	for (const line of stack.split("\n")) {
		const location = appFrameLocation(line);
		if (location && !frames.includes(location)) {
			frames.push(location);
			if (frames.length === MAX_APP_STACK_FRAMES) break;
		}
	}
	return frames;
}
var HYDRATION_MARKER = "Hydration failed because the server rendered";
var HYDRATION_DOCS_LINK = "react.dev/link/hydration-mismatch";
var DIFF_LINE_REGEX = /^\s*[+-]\s/;
var COMPONENT_NAME_REGEX = /^\s*at\s+(\S+)/;
var MAX_HYDRATION_DIFF_CHARS = 3e3;
var MAX_HYDRATION_TREE_CHARS = 3e3;
var MAX_COMPONENT_STACK_CHARS = 1500;
var MAX_COMPONENT_STACK_FRAMES = 8;
var MAX_HYDRATION_EXPLANATION_CHARS = 300;
function extractHydrationTree(message) {
	const linkIndex = message.indexOf(HYDRATION_DOCS_LINK);
	return linkIndex === -1 ? message : message.slice(linkIndex + 33).trim();
}
function extractHydrationDiff(tree) {
	const lines = tree.split("\n");
	const firstDiffIndex = lines.findIndex((line) => DIFF_LINE_REGEX.test(line));
	if (firstDiffIndex === -1) return "";
	return [...firstDiffIndex > 0 ? [lines[firstDiffIndex - 1]] : [], ...lines.slice(firstDiffIndex).filter((line) => DIFF_LINE_REGEX.test(line))].join("\n");
}
function trimTo(text, maxChars) {
	return text.length > maxChars ? `${text.slice(0, maxChars)} \u2026` : text;
}
function componentFrameLabel(line) {
	const location = appFrameLocation(line);
	return location ? `at ${line.match(COMPONENT_NAME_REGEX)?.[1] ?? "<anonymous>"} (${location})` : null;
}
function appComponentStack(componentStack) {
	if (typeof componentStack !== "string") return "";
	const lines = componentStack.split("\n").filter((line) => line.trim());
	const frames = lines.map(componentFrameLabel).filter((label) => !!label).slice(0, MAX_COMPONENT_STACK_FRAMES);
	return trimTo((frames.length ? frames : lines.slice(0, MAX_COMPONENT_STACK_FRAMES).map((line) => line.trim())).join("\n"), MAX_COMPONENT_STACK_CHARS);
}
function isHydrationError(error) {
	return error instanceof Error && error.message.includes(HYDRATION_MARKER);
}
function buildHydrationReport({ message, componentStack }) {
	const headline = message.split(/\.\s|\n/)[0].trim();
	const tree = extractHydrationTree(message);
	const diff = trimTo(extractHydrationDiff(tree) || tree, MAX_HYDRATION_DIFF_CHARS);
	const stack = appComponentStack(componentStack);
	const explanation = trimTo(message.slice(headline.length).split(HYDRATION_DOCS_LINK)[0].replace(/^[.\s]+|https?:\/\/\s*$/g, "").trim(), MAX_HYDRATION_EXPLANATION_CHARS);
	return {
		text: [
			headline,
			diff,
			stack && `Component stack:
${stack}`,
			tree !== diff && `Element tree:
${trimTo(tree, MAX_HYDRATION_TREE_CHARS)}`,
			explanation
		].filter(Boolean).join("\n\n"),
		diff,
		componentStack: stack
	};
}
var DIFF_SIDE_LINE_REGEX = /^\s*([+-])\s+(\S.*)$/;
var EDIT_ID_VALUE_REGEX = /(data-edit-(?:assisted-)?id)=(?:"[^"]*"|\{[^}]*\})/g;
var TRUNCATION_MARK = "…";
function splitDiffSides(diff) {
	const serverLines = [];
	const clientLines = [];
	for (const line of diff.split("\n")) {
		const match = line.match(DIFF_SIDE_LINE_REGEX);
		if (match) (match[1] === "-" ? serverLines : clientLines).push(match[2].trim());
	}
	return {
		serverLines,
		clientLines
	};
}
function blankEditIdValues(line) {
	return line.replace(EDIT_ID_VALUE_REGEX, "$1=\"\"");
}
function hasBalancedSides({ serverLines, clientLines }) {
	return serverLines.length > 0 && serverLines.length === clientLines.length;
}
function hasSameLinesIgnoringEditIds({ serverLines, clientLines }) {
	return serverLines.every((line, index) => blankEditIdValues(line) === blankEditIdValues(clientLines[index]));
}
function hasDifferentLines({ serverLines, clientLines }) {
	return serverLines.some((line, index) => line !== clientLines[index]);
}
function isEditIdOnlyHydrationDiff(diff) {
	if (!diff || diff.includes(TRUNCATION_MARK)) return false;
	const sides = splitDiffSides(diff);
	return hasBalancedSides(sides) && hasSameLinesIgnoringEditIds(sides) && hasDifferentLines(sides);
}
function isEditIdOnlyHydrationMessage(message) {
	return message.includes(HYDRATION_DOCS_LINK) && isEditIdOnlyHydrationDiff(extractHydrationDiff(extractHydrationTree(message)));
}
var pendingHydrationReport = null;
function reportHydrationError({ error, componentStack }) {
	if (isEditIdOnlyHydrationMessage(error.message)) return;
	try {
		pendingHydrationReport = {
			error,
			...buildHydrationReport({
				message: error.message,
				componentStack
			})
		};
	} catch {
		pendingHydrationReport = null;
	}
	try {
		reportError(error);
	} finally {
		pendingHydrationReport = null;
	}
}
if (typeof window !== "undefined") {
	let handleViteOverlay = function(node) {
		if (!node.shadowRoot) return;
		const backdrop = node.shadowRoot.querySelector(".backdrop");
		if (backdrop) {
			const overlayHtml = backdrop.outerHTML;
			const doc = new DOMParser().parseFromString(overlayHtml, "text/html");
			const messageBodyElement = doc.querySelector(".message-body");
			const fileElement = doc.querySelector(".file");
			const messageText = messageBodyElement ? messageBodyElement.textContent.trim() : "";
			if (messageText.includes("transport was disconnected")) return;
			const fileText = fileElement ? fileElement.textContent.trim() : "";
			const error = messageText + (fileText ? ` File:${fileText}` : "");
			window.parent.postMessage({
				type: "horizons-vite-error",
				error
			}, "*");
		}
	}, formatRouterError = function(error) {
		if (error instanceof Error) return error.name && error.name !== "Error" ? `${error.name}: ${error.message}` : error.message || error.name || "Error";
		if (!error || typeof error !== "object") return error ? String(error) : null;
		const { status, statusText, data, message } = error;
		if (typeof status === "number") {
			if (status < 500) return null;
			if (typeof data === "string" && data.includes(PREVIEW_STARTING_MARKER)) return null;
			const detail = typeof data === "string" && data ? `: ${data}` : "";
			return `${status} ${statusText || "Server Error"}${detail}`;
		}
		if (typeof message === "string" && message) return message;
		try {
			return JSON.stringify(error);
		} catch {
			return String(error);
		}
	}, describeRouterError = function(routeId, error) {
		const message = formatRouterError(error);
		if (!message) return null;
		const frames = error instanceof Error ? appStackFrames(error.stack) : [];
		const origin = frames.length ? `${routeId}, ${frames[0]}` : routeId;
		const report = `SSR error on ${window.location.pathname} (${origin}): ${message}`;
		return frames.length > 1 ? `${report}
(render path: ${frames.slice(1).join(" ← ")})` : report;
	}, reportRouterErrors = function(state) {
		if (!state.errors) {
			lastReportedRouterError = null;
			return;
		}
		const error = Object.entries(state.errors).map(([routeId, routeError]) => describeRouterError(routeId, routeError)).filter((message) => !!message).join("\n");
		if (!error) {
			lastReportedRouterError = null;
			return;
		}
		if (error === lastReportedRouterError) return;
		lastReportedRouterError = error;
		window.parent.postMessage({
			type: "horizons-ssr-error",
			error
		}, "*");
	}, watchRouterErrors = function() {
		const router = window.__reactRouterDataRouter;
		if (!router) return false;
		reportRouterErrors(router.state);
		router.subscribe(reportRouterErrors);
		return true;
	}, parseStackFrameLine = function(line) {
		const lineColMatch = line.match(MATCH_LINE_COL_REGEX);
		if (!lineColMatch) return null;
		const [, lineNum, colNum] = lineColMatch;
		const suffix = `:${lineNum}:${colNum}`;
		const idx = line.lastIndexOf(suffix);
		if (idx === -1) return null;
		const stackPath = line.substring(0, idx).replace(MATCH_AT_REGEX, "").trim();
		if (!stackPath) return null;
		try {
			const pathname = new URL(stackPath).pathname;
			return `${pathname.replace(MATCH_PATH_REGEX, "") || pathname}:${lineNum}:${colNum}`;
		} catch {
			return `${stackPath.replace(MATCH_PATH_REGEX, "") || stackPath}:${lineNum}:${colNum}`;
		}
	}, getFilePathFromStack = function(stack, skipFrames = 0) {
		if (!stack || typeof stack !== "string") return null;
		return stack.split("\n").slice(1).map((line) => parseStackFrameLine(line.replace(/\r$/, ""))).filter(Boolean)[skipFrames] ?? null;
	}, formatConsoleMessage = function(args, skipStackFrames = 1) {
		let messageString = "";
		let filePath = null;
		for (let i = 0; i < args.length; i++) {
			const arg = args[i];
			if (arg instanceof Error) {
				filePath = getFilePathFromStack(arg.stack, 0);
				messageString = `${arg.name}: ${arg.message}`;
				if (filePath) messageString = `${messageString} at ${filePath}`;
				break;
			}
		}
		if (!messageString) {
			messageString = args.map((arg) => typeof arg === "object" ? JSON.stringify(arg) : String(arg)).join(" ");
			const stack = (/* @__PURE__ */ new Error()).stack;
			filePath = getFilePathFromStack(stack, skipStackFrames);
			if (filePath) messageString = `${messageString} at ${filePath}`;
		}
		return messageString;
	}, isBenignFetchError = function(url, body) {
		return BENIGN_FETCH_ERRORS.some(([urlPattern, bodyPattern]) => urlPattern.test(url) && (!bodyPattern || bodyPattern.test(body)));
	}, hasValidationCode = function(value) {
		if (value == null) return false;
		if (typeof value === "string") return value.startsWith("validation_");
		if (Array.isArray(value)) return value.some(hasValidationCode);
		if (typeof value === "object") return Object.values(value).some(hasValidationCode);
		return false;
	}, isValidationFetchWarning = function(url, body) {
		if (!PLATFORM_URL_PATTERN.test(url)) return false;
		try {
			return hasValidationCode(JSON.parse(body));
		} catch {
			return VALIDATION_CODE_TEXT_PATTERN.test(body);
		}
	};
	new MutationObserver((mutations) => {
		for (const mutation of mutations) for (const addedNode of mutation.addedNodes) if (addedNode.nodeType === Node.ELEMENT_NODE && (addedNode.tagName?.toLowerCase() === "vite-error-overlay" || addedNode.classList?.contains("backdrop"))) handleViteOverlay(addedNode);
	}).observe(document.documentElement, {
		childList: true,
		subtree: true
	});
	window.onerror = (message, source, lineno, colno, errorObj) => {
		const hydration = pendingHydrationReport?.error === errorObj ? pendingHydrationReport : null;
		const errorDetails = errorObj ? JSON.stringify({
			name: errorObj.name,
			message: hydration ? hydration.text : errorObj.message,
			stack: errorObj.stack,
			source,
			lineno,
			colno
		}) : null;
		window.parent.postMessage({
			type: "horizons-runtime-error",
			message,
			error: errorDetails,
			...hydration ? {
				hydrationDiff: hydration.diff,
				componentStack: hydration.componentStack
			} : {}
		}, "*");
	};
	const ROUTER_POLL_INTERVAL_MS = 100;
	const ROUTER_POLL_TIMEOUT_MS = 2e4;
	const unpatchedConsoleWarn = console.warn;
	let lastReportedRouterError = null;
	const PREVIEW_STARTING_MARKER = "Your preview is starting";
	if (!watchRouterErrors()) {
		const routerPollStartedAt = Date.now();
		const routerPollInterval = setInterval(() => {
			if (watchRouterErrors()) {
				clearInterval(routerPollInterval);
				return;
			}
			if (Date.now() - routerPollStartedAt > ROUTER_POLL_TIMEOUT_MS) {
				clearInterval(routerPollInterval);
				unpatchedConsoleWarn("[horizons-runtime] React Router data router never appeared, SSR errors will not be reported.");
			}
		}, ROUTER_POLL_INTERVAL_MS);
	}
	const originalConsoleError = console.error;
	const MATCH_LINE_COL_REGEX = /:(\d+):(\d+)\)?\s*$/;
	const MATCH_AT_REGEX = /^\s*at\s+(?:async\s+)?(?:.*?\s+)?\(?/;
	const MATCH_PATH_REGEX = /^\//;
	console.error = function(...args) {
		if (isEditIdOnlyHydrationMessage(args.map((arg) => String(arg)).join("\n"))) return;
		originalConsoleError.apply(console, args);
		window.parent.postMessage({
			type: "horizons-console-error",
			error: formatConsoleMessage(args, 1)
		}, "*");
	};
	const originalConsoleWarn = console.warn;
	console.warn = function(...args) {
		originalConsoleWarn.apply(console, args);
		window.parent.postMessage({
			type: "horizons-console-warn",
			warning: formatConsoleMessage(args, 1)
		}, "*");
	};
	const BENIGN_FETCH_ERRORS = [
		[/hcgi\/platform\/api\/collections\/.*auth-with-password.*/i, /Failed to authenticate/i],
		[/hcgi\/api\//i, /Insufficient credits/i],
		[/hcgi\/api\//i, /INTEGRATION_NOT_CONFIGURED/i],
		[/hcgi\/platform\/api\/realtime/i, /Invalid realtime client|previous request authorization/i],
		[/hcgi\/platform\/api\/collections\/[^/]+\/(auth-with-|request-)/i, /Too Many Requests/i]
	];
	const PLATFORM_URL_PATTERN = /hcgi\/platform\//i;
	const VALIDATION_CODE_TEXT_PATTERN = /validation_/;
	const originalFetch = window.fetch;
	window.fetch = function(...args) {
		const url = resolveFetchUrl(args[0]);
		if (url.startsWith("ws:") || url.startsWith("wss:")) return originalFetch.apply(this, args);
		return originalFetch.apply(this, args).then(async (response) => {
			const contentType = response.headers.get("Content-Type") || "";
			const isDocumentResponse = contentType.includes("text/html") || contentType.includes("application/xhtml+xml");
			const isOpaqueResponse = response.type === "opaque";
			if (!response.ok && !isDocumentResponse && !isOpaqueResponse) {
				const errorFromRes = await response.clone().text();
				const requestUrl = response.url;
				const errorMessage = `Fetch error from ${requestUrl}: ${errorFromRes}`;
				if (isBenignFetchError(requestUrl, errorFromRes)) console.info(errorMessage);
				else if (isValidationFetchWarning(requestUrl, errorFromRes)) console.warn(errorMessage);
				else console.error(errorMessage);
			}
			return response;
		}).catch((error) => {
			if (!url.match(/\.html?$/i)) {
				if (error?.name === "AbortError") console.info(error);
				else console.error(error);
			}
			throw error;
		});
	};
	if (window.navigation && window.self !== window.top) window.navigation.addEventListener("navigate", (event) => {
		const url = event.destination.url;
		try {
			if (new URL(url).origin === window.location.origin) return;
		} catch {
			return;
		}
		window.parent.postMessage({
			type: "horizons-navigation-error",
			url
		}, "*");
	});
}
export { buildHydrationReport, isEditIdOnlyHydrationDiff, isEditIdOnlyHydrationMessage, isHydrationError, reportHydrationError };
