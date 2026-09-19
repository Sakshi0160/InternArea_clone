const UAParser = require("ua-parser-js");

function getLoginInfo(req) {
  const userAgent = req.headers["user-agent"] || "";

  let browser = "Unknown";
  let operatingSystem = "Unknown";
  let deviceType = "unknown";

 // =============================
// Browser
// =============================
if (/Edg|EdgiOS|EdgA/i.test(userAgent)) {
  browser = "Microsoft Edge";
} else if (/CriOS/i.test(userAgent)) {
  browser = "Google Chrome";
} else if (/Chrome/i.test(userAgent) && !/Edg/i.test(userAgent)) {
  browser = "Google Chrome";
} else if (/FxiOS/i.test(userAgent)) {
  browser = "Mozilla Firefox";
} else if (/Firefox/i.test(userAgent)) {
  browser = "Mozilla Firefox";
} else if (/OPiOS|OPR/i.test(userAgent)) {
  browser = "Opera";
} else if (/Safari/i.test(userAgent)) {
  browser = "Safari";
}

  // Operating System
  if (/Windows NT/i.test(userAgent)) {
    operatingSystem = "Windows";
  } else if (/Android/i.test(userAgent)) {
    operatingSystem = "Android";
  } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
    operatingSystem = "iOS";
  } else if (/Mac OS X/i.test(userAgent)) {
    operatingSystem = "macOS";
  } else if (/Linux/i.test(userAgent)) {
    operatingSystem = "Linux";
  }

  // Device Type
  if (/iPhone|Android.*Mobile|Windows Phone/i.test(userAgent)) {
    deviceType = "mobile";
  } else if (/iPad|Android(?!.*Mobile)/i.test(userAgent)) {
    deviceType = "laptop";
  } else if (/Windows|Macintosh|Linux/i.test(userAgent)) {
    deviceType = "desktop";
  }

  // IP Address
  let ipAddress =
    req.headers["x-forwarded-for"] ||
    req.socket.remoteAddress ||
    "";

  if (typeof ipAddress === "string" && ipAddress.includes(",")) {
    ipAddress = ipAddress.split(",")[0].trim();
  }

  if (ipAddress === "::1") {
    ipAddress = "127.0.0.1";
  }

  return {
    browser,
    operatingSystem,
    deviceType,
    ipAddress,
  };
}

module.exports = getLoginInfo;
