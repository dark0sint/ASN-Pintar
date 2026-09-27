/**
 * Mengonversi durasi modul (menit) menjadi Jam Pelajaran (JP).
 * Definisi 1 JP = 60 menit belajar efektif, dapat disesuaikan kebijakan
 * BKPSDM masing-masing instansi (mis. 1 JP = 45 menit sesuai standar diklat).
 */
export function menitToJp(menit: number): number {
  return +(menit / 60).toFixed(2);
}
