import jwt from "jsonwebtoken";
import crypto from "crypto";
import { config } from "../config";

/**
 * Membuat nama room unik dan URL Jitsi Meet yang mengarah ke server self-hosted
 * instansi (JITSI_DOMAIN di .env), bukan ke meet.jit.si publik.
 *
 * Jika JITSI_APP_ID & JITSI_APP_SECRET diisi (server Jitsi dikonfigurasi dengan
 * JWT auth via Prosody, lihat docs/jitsi-setup.md), sebuah token ditandatangani
 * agar hanya pengguna yang sudah login di ASN Pintar dapat membuat/bergabung ke
 * room tersebut. Tanpa JWT_SECRET Jitsi, room bersifat terbuka bagi siapa pun
 * yang memiliki tautannya — cukup untuk uji coba, TIDAK disarankan untuk produksi.
 */
export function generateRoomName(judul: string) {
  return `asnpintar-${judul.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40)}-${crypto
    .randomBytes(3)
    .toString("hex")}`;
}

export function createLiveClassRoom(judul: string, userIdModerator: string) {
  const room = generateRoomName(judul);
  return signJitsiUrl(room, userIdModerator);
}

/** Membuat URL join (dengan token JWT segar jika Jitsi diaktifkan dengan auth) untuk room yang SUDAH ADA. */
export function signJitsiUrl(room: string, userIdModerator: string, isModerator = false) {
  let token: string | undefined;
  if (config.jitsi.appId && config.jitsi.appSecret) {
    token = jwt.sign(
      {
        context: {
          user: { id: userIdModerator, moderator: isModerator },
        },
        aud: config.jitsi.appId,
        iss: config.jitsi.appId,
        sub: config.jitsi.domain,
        room,
      },
      config.jitsi.appSecret,
      { expiresIn: "6h" }
    );
  }

  const url = `https://${config.jitsi.domain}/${room}${token ? `?jwt=${token}` : ""}`;
  return { room, url };
}
