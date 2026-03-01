export interface KnownLocation {
  lat: number
  lng: number
  /** Radius i meter — brukes for å spre punkter innen et område */
  radiusM?: number
}

/**
 * Oslo bydeler — sentrum-koordinater.
 * Kilde: Oslo kommunes geografiske data (offentlig tilgjengelig).
 */
export const OSLO_DISTRICTS: Record<string, KnownLocation> = {
  'grønland':        { lat: 59.9107, lng: 10.7631, radiusM: 500 },
  'gronland':        { lat: 59.9107, lng: 10.7631, radiusM: 500 },
  'tøyen':           { lat: 59.9155, lng: 10.7723, radiusM: 500 },
  'toyen':           { lat: 59.9155, lng: 10.7723, radiusM: 500 },
  'sentrum':         { lat: 59.9128, lng: 10.7378, radiusM: 800 },
  'grünerløkka':     { lat: 59.9218, lng: 10.7582, radiusM: 700 },
  'grunerløkka':     { lat: 59.9218, lng: 10.7582, radiusM: 700 },
  'grunerlokka':     { lat: 59.9218, lng: 10.7582, radiusM: 700 },
  'sagene':          { lat: 59.9312, lng: 10.7551, radiusM: 700 },
  'torshov':         { lat: 59.9281, lng: 10.7654, radiusM: 400 },
  'stovner':         { lat: 59.9487, lng: 10.9256, radiusM: 800 },
  'romsås':          { lat: 59.9584, lng: 10.9001, radiusM: 600 },
  'romsas':          { lat: 59.9584, lng: 10.9001, radiusM: 600 },
  'grorud':          { lat: 59.9456, lng: 10.8712, radiusM: 700 },
  'alna':            { lat: 59.9301, lng: 10.8621, radiusM: 900 },
  'holmlia':         { lat: 59.8521, lng: 10.8134, radiusM: 700 },
  'nordstrand':      { lat: 59.8733, lng: 10.8021, radiusM: 800 },
  'østensjø':        { lat: 59.8901, lng: 10.8312, radiusM: 800 },
  'ostensjø':        { lat: 59.8901, lng: 10.8312, radiusM: 800 },
  'bjerke':          { lat: 59.9389, lng: 10.8012, radiusM: 700 },
  'gamle oslo':      { lat: 59.9060, lng: 10.7750, radiusM: 900 },
  'frogner':         { lat: 59.9212, lng: 10.7001, radiusM: 800 },
  'majorstuen':      { lat: 59.9301, lng: 10.7145, radiusM: 600 },
  'ullern':          { lat: 59.9101, lng: 10.6312, radiusM: 800 },
  'vestre aker':     { lat: 59.9501, lng: 10.6612, radiusM: 1200 },
  'nordre aker':     { lat: 59.9612, lng: 10.7456, radiusM: 1200 },
  'nordre aker':     { lat: 59.9612, lng: 10.7456, radiusM: 1200 },
  'søndre nordstrand': { lat: 59.8312, lng: 10.7901, radiusM: 1200 },
  'sondre nordstrand': { lat: 59.8312, lng: 10.7901, radiusM: 1200 },
  'marka':           { lat: 59.9823, lng: 10.7201, radiusM: 3000 },

  // Nabolag
  'aker brygge':     { lat: 59.9097, lng: 10.7278, radiusM: 200 },
  'tjuvholmen':      { lat: 59.9076, lng: 10.7212, radiusM: 200 },
  'vulkan':          { lat: 59.9234, lng: 10.7512, radiusM: 200 },
  'løren':           { lat: 59.9389, lng: 10.7912, radiusM: 400 },
  'loren':           { lat: 59.9389, lng: 10.7912, radiusM: 400 },
  'hasle':           { lat: 59.9356, lng: 10.8001, radiusM: 400 },
  'skøyen':          { lat: 59.9156, lng: 10.6756, radiusM: 400 },
  'skoyen':          { lat: 59.9156, lng: 10.6756, radiusM: 400 },
  'lysaker':         { lat: 59.9080, lng: 10.6340, radiusM: 400 },
  'bryn':            { lat: 59.8978, lng: 10.8345, radiusM: 400 },
  'helsfyr':         { lat: 59.9045, lng: 10.8012, radiusM: 400 },
  'ensjø':           { lat: 59.9023, lng: 10.7934, radiusM: 400 },
  'ensjo':           { lat: 59.9023, lng: 10.7934, radiusM: 400 },
  'ryen':            { lat: 59.8867, lng: 10.8134, radiusM: 400 },
  'oppsal':          { lat: 59.8778, lng: 10.8312, radiusM: 400 },
  'lambertseter':    { lat: 59.8645, lng: 10.8123, radiusM: 500 },
  'manglerud':       { lat: 59.8834, lng: 10.8234, radiusM: 400 },
  'høyenhall':       { lat: 59.8923, lng: 10.8456, radiusM: 300 },
  'vålerenga':       { lat: 59.9012, lng: 10.7823, radiusM: 400 },
  'valerenga':       { lat: 59.9012, lng: 10.7823, radiusM: 400 },
  'kampen':          { lat: 59.9089, lng: 10.7756, radiusM: 300 },
  'etterstad':       { lat: 59.9023, lng: 10.7934, radiusM: 300 },
  'sinsen':          { lat: 59.9389, lng: 10.7823, radiusM: 300 },
  'refstad':         { lat: 59.9312, lng: 10.7845, radiusM: 300 },
  'nydalen':         { lat: 59.9512, lng: 10.7645, radiusM: 400 },
  'sandaker':        { lat: 59.9434, lng: 10.7612, radiusM: 300 },
  'storo':           { lat: 59.9456, lng: 10.7734, radiusM: 300 },
  'grefsen':         { lat: 59.9601, lng: 10.7712, radiusM: 500 },
  'kjelsås':         { lat: 59.9689, lng: 10.7834, radiusM: 400 },
  'korsvoll':        { lat: 59.9712, lng: 10.7456, radiusM: 400 },
  'vinderen':        { lat: 59.9445, lng: 10.6934, radiusM: 400 },
  'slemdal':         { lat: 59.9534, lng: 10.6712, radiusM: 400 },
  'røa':             { lat: 59.9445, lng: 10.6512, radiusM: 400 },
  'roa':             { lat: 59.9445, lng: 10.6512, radiusM: 400 },
  'holmen':          { lat: 59.9312, lng: 10.6412, radiusM: 400 },
  'smestad':         { lat: 59.9301, lng: 10.6634, radiusM: 300 },
  'silurveien':      { lat: 59.9289, lng: 10.6801, radiusM: 200 },
  'nationaltheatret':{ lat: 59.9145, lng: 10.7312, radiusM: 200 },
  'stortinget':      { lat: 59.9134, lng: 10.7389, radiusM: 100 },
  'oslo s':          { lat: 59.9111, lng: 10.7534, radiusM: 300 },
  'oslo sentralstasjon': { lat: 59.9111, lng: 10.7534, radiusM: 300 },
  'jernbanetorget':  { lat: 59.9111, lng: 10.7534, radiusM: 200 },
  'youngstorget':    { lat: 59.9156, lng: 10.7478, radiusM: 150 },
  'akerselva':       { lat: 59.9234, lng: 10.7556, radiusM: 600 },

  // Omkringliggende kommuner
  'bærum':           { lat: 59.8941, lng: 10.5267, radiusM: 3000 },
  'baerum':          { lat: 59.8941, lng: 10.5267, radiusM: 3000 },
  'sandvika':        { lat: 59.8867, lng: 10.5212, radiusM: 600 },
  'asker':           { lat: 59.8323, lng: 10.4356, radiusM: 2000 },
  'lørenskog':       { lat: 59.9201, lng: 10.9612, radiusM: 2000 },
  'lorenskog':       { lat: 59.9201, lng: 10.9612, radiusM: 2000 },
  'ski':             { lat: 59.7178, lng: 10.8312, radiusM: 2000 },
  'lillestrøm':      { lat: 59.9556, lng: 11.0512, radiusM: 2000 },
  'lillestrom':      { lat: 59.9556, lng: 11.0512, radiusM: 2000 },
  'drøbak':          { lat: 59.6567, lng: 10.6234, radiusM: 2000 },
}

/**
 * Sentrale gater og steder i Oslo.
 */
export const OSLO_STREETS: Record<string, KnownLocation> = {
  'karl johans gate':     { lat: 59.9128, lng: 10.7378, radiusM: 300 },
  'karl johans':          { lat: 59.9128, lng: 10.7378, radiusM: 300 },
  'storgata':             { lat: 59.9115, lng: 10.7534, radiusM: 500 },
  'prinsens gate':        { lat: 59.9123, lng: 10.7456, radiusM: 300 },
  'grønlandsleiret':      { lat: 59.9101, lng: 10.7689, radiusM: 200 },
  'tøyengata':            { lat: 59.9145, lng: 10.7712, radiusM: 300 },
  'schweigaards gate':    { lat: 59.9095, lng: 10.7656, radiusM: 300 },
  'dronningens gate':     { lat: 59.9112, lng: 10.7401, radiusM: 300 },
  'kirkegata':            { lat: 59.9120, lng: 10.7423, radiusM: 200 },
  'akersgata':            { lat: 59.9145, lng: 10.7367, radiusM: 300 },
  'thorvald meyers gate': { lat: 59.9212, lng: 10.7578, radiusM: 400 },
  'markveien':            { lat: 59.9223, lng: 10.7545, radiusM: 300 },
  'bogstadveien':         { lat: 59.9278, lng: 10.7201, radiusM: 400 },
  'kirkeveien':           { lat: 59.9289, lng: 10.7123, radiusM: 500 },
  'industrigata':         { lat: 59.9334, lng: 10.7512, radiusM: 300 },
  'maridalsveien':        { lat: 59.9401, lng: 10.7612, radiusM: 600 },
  'trondheimsveien':      { lat: 59.9345, lng: 10.7823, radiusM: 600 },
  'strømsveien':          { lat: 59.9112, lng: 10.8234, radiusM: 800 },
  'mosseveien':           { lat: 59.8756, lng: 10.7812, radiusM: 1000 },
  'e18':                  { lat: 59.9080, lng: 10.6340, radiusM: 2000 },
  'e6':                   { lat: 59.9112, lng: 10.8234, radiusM: 3000 },
  'ring 3':               { lat: 59.9289, lng: 10.8012, radiusM: 2000 },
  'rv4':                  { lat: 59.9456, lng: 10.8412, radiusM: 2000 },
}

/** Default-koordinat for Oslo — brukes som siste fallback */
export const OSLO_DEFAULT: KnownLocation = {
  lat: 59.9139,
  lng: 10.7522,
  radiusM: 5000,
}
