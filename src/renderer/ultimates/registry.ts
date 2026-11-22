import type {
  ActiveUltimateState,
  ArenaBounds,
  ArenaObstacle,
  FighterState,
} from '../../types/game';
import { aceUltimateRenderer } from './aceDraw';
import { ahriUltimateRenderer } from './ahriDraw';
import { aizenUltimateRenderer } from './aizenDraw';
import { akainuUltimateRenderer } from './akainuDraw';
import { akazaUltimateRenderer } from './akazaDraw';
import { allmightUltimateRenderer } from './allmightDraw';
import { aokijiUltimateRenderer } from './aokijiDraw';
import { archerEmiyaUltimateRenderer } from './archerEmiyaDraw';
import { astaUltimateRenderer } from './astaDraw';
import { bakugoUltimateRenderer } from './bakugoDraw';
import { banUltimateRenderer } from './banDraw';
import { beerusUltimateRenderer } from './beerusDraw';
import { blackbeardUltimateRenderer } from './blackbeardDraw';
import { brolyUltimateRenderer } from './brolyDraw';
import { byakuyaUltimateRenderer } from './byakuyaDraw';
import { cellUltimateRenderer } from './cellDraw';
import { creeperUltimateRenderer } from './creeperDraw';
import { dekuUltimateRenderer } from './dekuDraw';
import { denjiUltimateRenderer } from './denjiDraw';
import { dioUltimateRenderer } from './dioDraw';
import { doflamingoUltimateRenderer } from './doflamingoDraw';
import { entity303UltimateRenderer } from './entity303Draw';
import { erenUltimateRenderer } from './erenDraw';
import { escanorUltimateRenderer } from './escanorDraw';
import { frierenUltimateRenderer } from './frierenDraw';
import { friezaUltimateRenderer } from './friezaDraw';
import { gaaraUltimateRenderer } from './gaaraDraw';
import { getoUltimateRenderer } from './getoDraw';
import { gilgameshUltimateRenderer } from './gilgameshDraw';
import { giornoUltimateRenderer } from './giornoDraw';
import { giyuUltimateRenderer } from './giyuDraw';
import { gohanUltimateRenderer } from './gohanDraw';
import { gojoUltimateRenderer } from './gojoDraw';
import { gokuUltimateRenderer } from './gokuDraw';
import { gonUltimateRenderer } from './gonDraw';
import { guyUltimateRenderer } from './guyDraw';
import { hakariUltimateRenderer } from './hakariDraw';
import { hashiramaUltimateRenderer } from './hashiramaDraw';
import { herobrineUltimateRenderer } from './herobrineDraw';
import { hisokaUltimateRenderer } from './hisokaDraw';
import { ichigoUltimateRenderer } from './ichigoDraw';
import { itachiUltimateRenderer } from './itachiDraw';
import { jinwooUltimateRenderer } from './jinwooDraw';
import { jinxUltimateRenderer } from './jinxDraw';
import { jiraiyaUltimateRenderer } from './jiraiyaDraw';
import { jirenUltimateRenderer } from './jirenDraw';
import { jotaroUltimateRenderer } from './jotaroDraw';
import { kaidoUltimateRenderer } from './kaidoDraw';
import { kakashiUltimateRenderer } from './kakashiDraw';
import { kashimoUltimateRenderer } from './kashimoDraw';
import { katakuriUltimateRenderer } from './katakuriDraw';
import { kenpachiUltimateRenderer } from './kenpachiDraw';
import { killuaUltimateRenderer } from './killuaDraw';
import { kizaruUltimateRenderer } from './kizaruDraw';
import { kokushiboUltimateRenderer } from './kokushiboDraw';
import { kratosUltimateRenderer } from './kratosDraw';
import { lawUltimateRenderer } from './lawDraw';
import { leviUltimateRenderer } from './leviDraw';
import { luffyUltimateRenderer } from './luffyDraw';
import { madaraUltimateRenderer } from './madaraDraw';
import { mahitoUltimateRenderer } from './mahitoDraw';
import { mahoragaUltimateRenderer } from './mahoragaDraw';
import { makiUltimateRenderer } from './makiDraw';
import { megumiUltimateRenderer } from './megumiDraw';
import { meliodasUltimateRenderer } from './meliodasDraw';
import { meruemUltimateRenderer } from './meruemDraw';
import { mihawkUltimateRenderer } from './mihawkDraw';
import { minatoUltimateRenderer } from './minatoDraw';
import { mobUltimateRenderer } from './mobDraw';
import { muzanUltimateRenderer } from './muzanDraw';
import { nanamiUltimateRenderer } from './nanamiDraw';
import { narutoUltimateRenderer } from './narutoDraw';
import { nobaraUltimateRenderer } from './nobaraDraw';
import { obitoUltimateRenderer } from './obitoDraw';
import { painUltimateRenderer } from './painDraw';
import { pikachuUltimateRenderer } from './pikachuDraw';
import { rengokuUltimateRenderer } from './rengokuDraw';
import { rimuruUltimateRenderer } from './rimuruDraw';
import { rukiaUltimateRenderer } from './rukiaDraw';
import { saberUltimateRenderer } from './saberDraw';
import { saitamaUltimateRenderer } from './saitamaDraw';
import { sanjiUltimateRenderer } from './sanjiDraw';
import { sansUltimateRenderer } from './sansDraw';
import { sasukeUltimateRenderer } from './sasukeDraw';
import { shanksUltimateRenderer } from './shanksDraw';
import { shigarakiUltimateRenderer } from './shigarakiDraw';
import { sonicUltimateRenderer } from './sonicDraw';
import { drawMinecraftObstacle, steveUltimateRenderer } from './steveDraw';
import { sukunaUltimateRenderer } from './sukunaDraw';
import { tanjiroUltimateRenderer } from './tanjiroDraw';
import { tengenUltimateRenderer } from './tengenDraw';
import { todoUltimateRenderer } from './todoDraw';
import { todorokiUltimateRenderer } from './todorokiDraw';
import { tojiUltimateRenderer } from './tojiDraw';
import { toshiroUltimateRenderer } from './toshiroDraw';
import type { UltimateRenderer } from './types';
import { ulquiorraUltimateRenderer } from './ulquiorraDraw';
import { uraharaUltimateRenderer } from './uraharaDraw';
import { vegetaUltimateRenderer } from './vegetaDraw';
import { vergilUltimateRenderer } from './vergilDraw';
import { wardenUltimateRenderer } from './wardenDraw';
import { whitebeardUltimateRenderer } from './whitebeardDraw';
import { witherUltimateRenderer } from './witherDraw';
import { yamamotoUltimateRenderer } from './yamamotoDraw';
import { yasuoUltimateRenderer } from './yasuoDraw';
import { yhwachUltimateRenderer } from './yhwachDraw';
import { yujiUltimateRenderer } from './yujiDraw';
import { yutaUltimateRenderer } from './yutaDraw';
import { zenitsuUltimateRenderer } from './zenitsuDraw';
import { zoroUltimateRenderer } from './zoroDraw';
import { dariusUltimateRenderer } from './dariusDraw';
import { gogetaUltimateRenderer } from './gogetaDraw';
import { gokuBlackUltimateRenderer } from './gokublackDraw';
import { jogoUltimateRenderer } from './jogoDraw';
import { mordekaiserUltimateRenderer } from './mordekaiserDraw';
import { natsuUltimateRenderer } from './natsuDraw';
import { neteroUltimateRenderer } from './neteroDraw';
import { vegitoUltimateRenderer } from './vegitoDraw';
import { yoneUltimateRenderer } from './yoneDraw';
import { zedUltimateRenderer } from './zedDraw';
import { aatroxUltimateRenderer } from './aatroxDraw';
import { dabiUltimateRenderer } from './dabiDraw';
import { endeavorUltimateRenderer } from './endeavorDraw';
import { garenUltimateRenderer } from './garenDraw';
import { gyomeiUltimateRenderer } from './gyomeiDraw';
import { makimaUltimateRenderer } from './makimaDraw';
import { royUltimateRenderer } from './royDraw';
import { sanemiUltimateRenderer } from './sanemiDraw';
import { shinobuUltimateRenderer } from './shinobuDraw';
import { viegoUltimateRenderer } from './viegoDraw';
import { acnologiaUltimateRenderer } from './acnologiaDraw';
import { erzaUltimateRenderer } from './erzaDraw';
import { gajeelUltimateRenderer } from './gajeelDraw';
import { gildartsUltimateRenderer } from './gildartsDraw';
import { grayUltimateRenderer } from './grayDraw';
import { jellalUltimateRenderer } from './jellalDraw';
import { juviaUltimateRenderer } from './juviaDraw';
import { laxusUltimateRenderer } from './laxusDraw';
import { lucyFtUltimateRenderer } from './lucy_ftDraw';
import { mirajaneUltimateRenderer } from './mirajaneDraw';
import { rogueFtUltimateRenderer } from './rogue_ftDraw';
import { stingUltimateRenderer } from './stingDraw';
import { wendyUltimateRenderer } from './wendyDraw';
import { zerefUltimateRenderer } from './zerefDraw';
import { alexUltimateRenderer } from './alexDraw';
import { blazeUltimateRenderer } from './blazeDraw';
import { endermanUltimateRenderer } from './endermanDraw';
import { evokerUltimateRenderer } from './evokerDraw';
import { ghastUltimateRenderer } from './ghastDraw';
import { ironGolemUltimateRenderer } from './irongolemDraw';
import { piglinUltimateRenderer } from './piglinDraw';
import { ravagerUltimateRenderer } from './ravagerDraw';
import { shulkerUltimateRenderer } from './shulkerDraw';
import { skeletonUltimateRenderer } from './skeletonDraw';
import { technobladeUltimateRenderer } from './technobladeDraw';
import { zombieUltimateRenderer } from './zombieDraw';
import { atomicUltimateRenderer } from './atomicDraw';
import { bangUltimateRenderer } from './bangDraw';
import { borosUltimateRenderer } from './borosDraw';
import { flashyflashUltimateRenderer } from './flashyflashDraw';
import { fubukiUltimateRenderer } from './fubukiDraw';
import { garouUltimateRenderer } from './garouDraw';
import { genosUltimateRenderer } from './genosDraw';
import { kingOpmUltimateRenderer } from './king_opmDraw';
import { metalbatUltimateRenderer } from './metalbatDraw';
import { orochiOpmUltimateRenderer } from './orochi_opmDraw';
import { sonicOpmUltimateRenderer } from './sonic_opmDraw';
import { tatsumakiUltimateRenderer } from './tatsumakiDraw';
import { watchdogUltimateRenderer } from './watchdogDraw';
import { zombiemanUltimateRenderer } from './zombiemanDraw';
import { antaresUltimateRenderer } from './antaresDraw';
import { ashbornUltimateRenderer } from './ashbornDraw';
import { baekYunhoUltimateRenderer } from './baek_yunhoDraw';
import { bellionUltimateRenderer } from './bellionDraw';
import { beruUltimateRenderer } from './beruDraw';
import { chaHaeInUltimateRenderer } from './cha_haeinDraw';
import { choiJongInUltimateRenderer } from './choi_jonginDraw';
import { goGunheeUltimateRenderer } from './go_gunheeDraw';
import { igrisUltimateRenderer } from './igrisDraw';
import { ironSlUltimateRenderer } from './iron_slDraw';
import { liuZhigangUltimateRenderer } from './liu_zhigangDraw';
import { thomasAndreUltimateRenderer } from './thomas_andreDraw';
import { tuskSlUltimateRenderer } from './tusk_slDraw';
import { annieUltimateRenderer } from './annieDraw';
import { arminUltimateRenderer } from './arminDraw';
import { connieUltimateRenderer } from './connieDraw';
import { erwinUltimateRenderer } from './erwinDraw';
import { hangeUltimateRenderer } from './hangeDraw';
import { jeanUltimateRenderer } from './jeanDraw';
import { laraUltimateRenderer } from './laraDraw';
import { mikasaUltimateRenderer } from './mikasaDraw';
import { porcoUltimateRenderer } from './porcoDraw';
import { reinerUltimateRenderer } from './reinerDraw';
import { sashaUltimateRenderer } from './sashaDraw';
import { zekeUltimateRenderer } from './zekeDraw';
import { charaUltimateRenderer } from './charaDraw';
import { cloudUltimateRenderer } from './cloudDraw';
import { hutaoUltimateRenderer } from './hutaoDraw';
import { jevilUltimateRenderer } from './jevilDraw';
import { kirbyUltimateRenderer } from './kirbyDraw';
import { linkUltimateRenderer } from './linkDraw';
import { marioUltimateRenderer } from './marioDraw';
import { papyrusUltimateRenderer } from './papyrusDraw';
import { raidenUltimateRenderer } from './raidenDraw';
import { scorpionUltimateRenderer } from './scorpionDraw';
import { subzeroUltimateRenderer } from './subzeroDraw';
import { undyneUltimateRenderer } from './undyneDraw';
import { zhongliUltimateRenderer } from './zhongliDraw';
import { akaliUltimateRenderer } from './akaliDraw';
import { ekkoUltimateRenderer } from './ekkoDraw';
import { ezrealUltimateRenderer } from './ezrealDraw';
import { katarinaUltimateRenderer } from './katarinaDraw';
import { kaynUltimateRenderer } from './kaynDraw';
import { leeSinUltimateRenderer } from './leesinDraw';
import { luxUltimateRenderer } from './luxDraw';
import { rivenUltimateRenderer } from './rivenDraw';
import { settUltimateRenderer } from './settDraw';
import { sylasUltimateRenderer } from './sylasDraw';
import { teemoUltimateRenderer } from './teemoDraw';
import { threshUltimateRenderer } from './threshDraw';
import { volibearUltimateRenderer } from './volibearDraw';
import { bigmomUltimateRenderer } from './bigmomDraw';
import { boaUltimateRenderer } from './boaDraw';
import { chosoUltimateRenderer } from './chosoDraw';
import { domaUltimateRenderer } from './domaDraw';
import { inosukeUltimateRenderer } from './inosukeDraw';
import { marcoUltimateRenderer } from './marcoDraw';
import { mitsuriUltimateRenderer } from './mitsuriDraw';
import { muichiroUltimateRenderer } from './muichiroDraw';
import { nezukoUltimateRenderer } from './nezukoDraw';
import { saboUltimateRenderer } from './saboDraw';
import { yamatoOpUltimateRenderer } from './yamato_opDraw';
import { android17UltimateRenderer } from './android17Draw';
import { android18UltimateRenderer } from './android18Draw';
import { bardockUltimateRenderer } from './bardockDraw';
import { buuUltimateRenderer } from './buuDraw';
import { dianeUltimateRenderer } from './dianeDraw';
import { estarossaUltimateRenderer } from './estarossaDraw';
import { gowtherUltimateRenderer } from './gowtherDraw';
import { hitUltimateRenderer } from './hitDraw';
import { kingSdsUltimateRenderer } from './king_sdsDraw';
import { merlinSdsUltimateRenderer } from './merlin_sdsDraw';
import { piccoloUltimateRenderer } from './piccoloDraw';
import { trunksUltimateRenderer } from './trunksDraw';
import { zeldrisUltimateRenderer } from './zeldrisDraw';
import { deidaraUltimateRenderer } from './deidaraDraw';
import { grimmjowUltimateRenderer } from './grimmjowDraw';
import { killerbeeUltimateRenderer } from './killerbeeDraw';
import { kisameUltimateRenderer } from './kisameDraw';
import { mayuriUltimateRenderer } from './mayuriDraw';
import { orochimaruUltimateRenderer } from './orochimaruDraw';
import { renjiUltimateRenderer } from './renjiDraw';
import { shunsuiUltimateRenderer } from './shunsuiDraw';
import { starrkUltimateRenderer } from './starrkDraw';
import { tobiramaUltimateRenderer } from './tobiramaDraw';
import { tsunadeUltimateRenderer } from './tsunadeDraw';
import { yoruichiUltimateRenderer } from './yoruichiDraw';
import { biskyUltimateRenderer } from './biskyDraw';
import { chrolloUltimateRenderer } from './chrolloDraw';
import { feitanUltimateRenderer } from './feitanDraw';
import { illumiUltimateRenderer } from './illumiDraw';
import { kiteUltimateRenderer } from './kiteDraw';
import { kurapikaUltimateRenderer } from './kurapikaDraw';
import { leorioUltimateRenderer } from './leorioDraw';
import { pitouUltimateRenderer } from './pitouDraw';
import { poufUltimateRenderer } from './poufDraw';
import { youpiUltimateRenderer } from './youpiDraw';
import { akiUltimateRenderer } from './akiDraw';
import { angelCsmUltimateRenderer } from './angel_csmDraw';
import { beamCsmUltimateRenderer } from './beam_csmDraw';
import { darknessDevilUltimateRenderer } from './darkness_devilDraw';
import { katanaManUltimateRenderer } from './katana_manDraw';
import { kishibeUltimateRenderer } from './kishibeDraw';
import { kobeniUltimateRenderer } from './kobeniDraw';
import { powerUltimateRenderer } from './powerDraw';
import { quanxiUltimateRenderer } from './quanxiDraw';
import { rezeUltimateRenderer } from './rezeDraw';
import { santaCsmUltimateRenderer } from './santa_csmDraw';
import { yoruUltimateRenderer } from './yoruDraw';
import { alphonseUltimateRenderer } from './alphonseDraw';
import { armstrongUltimateRenderer } from './armstrongDraw';
import { edwardUltimateRenderer } from './edwardDraw';
import { envyFmaUltimateRenderer } from './envy_fmaDraw';
import { fatherFmaUltimateRenderer } from './father_fmaDraw';
import { gluttonyFmaUltimateRenderer } from './gluttony_fmaDraw';
import { greedlingUltimateRenderer } from './greedlingDraw';
import { hohenheimUltimateRenderer } from './hohenheimDraw';
import { kingBradleyUltimateRenderer } from './kingbradleyDraw';
import { lustFmaUltimateRenderer } from './lust_fmaDraw';
import { olivierUltimateRenderer } from './olivierDraw';
import { prideFmaUltimateRenderer } from './pride_fmaDraw';
import { scarFmaUltimateRenderer } from './scar_fmaDraw';
import { slothFmaUltimateRenderer } from './sloth_fmaDraw';
import { allForOneUltimateRenderer } from './allforoneDraw';
import { hawksUltimateRenderer } from './hawksDraw';
import { iidaUltimateRenderer } from './iidaDraw';
import { kirishimaUltimateRenderer } from './kirishimaDraw';
import { mirioUltimateRenderer } from './mirioDraw';
import { togaUltimateRenderer } from './togaDraw';
import { tokoyamiUltimateRenderer } from './tokoyamiDraw';
import { urarakaUltimateRenderer } from './urarakaDraw';
import { brunoUltimateRenderer } from './brunoDraw';
import { diavoloUltimateRenderer } from './diavoloDraw';
import { jolyneUltimateRenderer } from './jolyneDraw';
import { jonathanUltimateRenderer } from './jonathanDraw';
import { josephUltimateRenderer } from './josephDraw';
import { josukeUltimateRenderer } from './josukeDraw';
import { kakyoinUltimateRenderer } from './kakyoinDraw';
import { karsUltimateRenderer } from './karsDraw';
import { kiraUltimateRenderer } from './kiraDraw';
import { polnareffUltimateRenderer } from './polnareffDraw';
import { pucciUltimateRenderer } from './pucciDraw';
import { rohanUltimateRenderer } from './rohanDraw';
import { danteBcUltimateRenderer } from './dante_bcDraw';
import { juliusUltimateRenderer } from './juliusDraw';
import { lichtUltimateRenderer } from './lichtDraw';
import { luciusUltimateRenderer } from './luciusDraw';
import { luckUltimateRenderer } from './luckDraw';
import { magnaUltimateRenderer } from './magnaDraw';
import { mereoleonaUltimateRenderer } from './mereoleonaDraw';
import { nachtUltimateRenderer } from './nachtDraw';
import { noelleUltimateRenderer } from './noelleDraw';
import { vanicaUltimateRenderer } from './vanicaDraw';
import { yamiUltimateRenderer } from './yamiDraw';
import { yunoUltimateRenderer } from './yunoDraw';
import { zenonUltimateRenderer } from './zenonDraw';
import { arjunaUltimateRenderer } from './arjunaDraw';
import { berserkerHercUltimateRenderer } from './berserker_hercDraw';
import { enkiduUltimateRenderer } from './enkiduDraw';
import { iskandarUltimateRenderer } from './iskandarDraw';
import { jalterUltimateRenderer } from './jalterDraw';
import { jeanneUltimateRenderer } from './jeanneDraw';
import { karnaUltimateRenderer } from './karnaDraw';
import { lancerCuUltimateRenderer } from './lancer_cuDraw';
import { riderMedusaUltimateRenderer } from './rider_medusaDraw';
import { rinTohsakaUltimateRenderer } from './rin_tohsakaDraw';
import { scathachUltimateRenderer } from './scathachDraw';
import { shirouUltimateRenderer } from './shirouDraw';
import { bingChillingUltimateRenderer } from './bing_chillingDraw';
import { popCatUltimateRenderer } from './pop_catDraw';
import { ricardoMilosUltimateRenderer } from './ricardo_milosDraw';
import { stonksManUltimateRenderer } from './stonks_manDraw';

export const ULTIMATE_RENDERERS: Readonly<Record<string, UltimateRenderer>> = {
  steve: steveUltimateRenderer,
  herobrine: herobrineUltimateRenderer,
  entity303: entity303UltimateRenderer,
  warden: wardenUltimateRenderer,
  wither: witherUltimateRenderer,
  creeper: creeperUltimateRenderer,
  sans: sansUltimateRenderer,
  pikachu: pikachuUltimateRenderer,
  yasuo: yasuoUltimateRenderer,
  ahri: ahriUltimateRenderer,
  jinx: jinxUltimateRenderer,
  vergil: vergilUltimateRenderer,
  sonic: sonicUltimateRenderer,
  kratos: kratosUltimateRenderer,
  luffy: luffyUltimateRenderer,
  goku: gokuUltimateRenderer,
  naruto: narutoUltimateRenderer,
  sasuke: sasukeUltimateRenderer,
  zoro: zoroUltimateRenderer,
  ichigo: ichigoUltimateRenderer,
  tanjiro: tanjiroUltimateRenderer,
  saitama: saitamaUltimateRenderer,
  levi: leviUltimateRenderer,
  eren: erenUltimateRenderer,
  jinwoo: jinwooUltimateRenderer,
  denji: denjiUltimateRenderer,
  vegeta: vegetaUltimateRenderer,
  killua: killuaUltimateRenderer,
  madara: madaraUltimateRenderer,
  deku: dekuUltimateRenderer,
  rimuru: rimuruUltimateRenderer,
  asta: astaUltimateRenderer,
  frieren: frierenUltimateRenderer,
  mob: mobUltimateRenderer,
  gojo: gojoUltimateRenderer,
  sukuna: sukunaUltimateRenderer,
  dio: dioUltimateRenderer,
  law: lawUltimateRenderer,
  shanks: shanksUltimateRenderer,
  kaido: kaidoUltimateRenderer,
  itachi: itachiUltimateRenderer,
  minato: minatoUltimateRenderer,
  yuta: yutaUltimateRenderer,
  hakari: hakariUltimateRenderer,
  gilgamesh: gilgameshUltimateRenderer,
  saber: saberUltimateRenderer,
  escanor: escanorUltimateRenderer,
  meliodas: meliodasUltimateRenderer,
  ace: aceUltimateRenderer,
  whitebeard: whitebeardUltimateRenderer,
  sanji: sanjiUltimateRenderer,
  kakashi: kakashiUltimateRenderer,
  pain: painUltimateRenderer,
  obito: obitoUltimateRenderer,
  toji: tojiUltimateRenderer,
  kashimo: kashimoUltimateRenderer,
  ban: banUltimateRenderer,
  archer_emiya: archerEmiyaUltimateRenderer,
  gaara: gaaraUltimateRenderer,
  jiraiya: jiraiyaUltimateRenderer,
  guy: guyUltimateRenderer,
  hashirama: hashiramaUltimateRenderer,
  megumi: megumiUltimateRenderer,
  aizen: aizenUltimateRenderer,
  yamamoto: yamamotoUltimateRenderer,
  kenpachi: kenpachiUltimateRenderer,
  zenitsu: zenitsuUltimateRenderer,
  rengoku: rengokuUltimateRenderer,
  yuji: yujiUltimateRenderer,
  nobara: nobaraUltimateRenderer,
  todo: todoUltimateRenderer,
  nanami: nanamiUltimateRenderer,
  maki: makiUltimateRenderer,
  geto: getoUltimateRenderer,
  yhwach: yhwachUltimateRenderer,
  byakuya: byakuyaUltimateRenderer,
  ulquiorra: ulquiorraUltimateRenderer,
  urahara: uraharaUltimateRenderer,
  jotaro: jotaroUltimateRenderer,
  giorno: giornoUltimateRenderer,
  frieza: friezaUltimateRenderer,
  broly: brolyUltimateRenderer,
  gohan: gohanUltimateRenderer,
  beerus: beerusUltimateRenderer,
  doflamingo: doflamingoUltimateRenderer,
  katakuri: katakuriUltimateRenderer,
  akaza: akazaUltimateRenderer,
  kokushibo: kokushiboUltimateRenderer,
  blackbeard: blackbeardUltimateRenderer,
  mihawk: mihawkUltimateRenderer,
  cell: cellUltimateRenderer,
  jiren: jirenUltimateRenderer,
  gon: gonUltimateRenderer,
  hisoka: hisokaUltimateRenderer,
  meruem: meruemUltimateRenderer,
  muzan: muzanUltimateRenderer,
  giyu: giyuUltimateRenderer,
  tengen: tengenUltimateRenderer,
  bakugo: bakugoUltimateRenderer,
  todoroki: todorokiUltimateRenderer,
  allmight: allmightUltimateRenderer,
  shigaraki: shigarakiUltimateRenderer,
  akainu: akainuUltimateRenderer,
  kizaru: kizaruUltimateRenderer,
  aokiji: aokijiUltimateRenderer,
  toshiro: toshiroUltimateRenderer,
  rukia: rukiaUltimateRenderer,
  mahito: mahitoUltimateRenderer,
  mahoraga: mahoragaUltimateRenderer,
  zed: zedUltimateRenderer,
  darius: dariusUltimateRenderer,
  mordekaiser: mordekaiserUltimateRenderer,
  yone: yoneUltimateRenderer,
  gogeta: gogetaUltimateRenderer,
  vegito: vegitoUltimateRenderer,
  gokublack: gokuBlackUltimateRenderer,
  jogo: jogoUltimateRenderer,
  netero: neteroUltimateRenderer,
  natsu: natsuUltimateRenderer,
  shinobu: shinobuUltimateRenderer,
  gyomei: gyomeiUltimateRenderer,
  sanemi: sanemiUltimateRenderer,
  dabi: dabiUltimateRenderer,
  endeavor: endeavorUltimateRenderer,
  garen: garenUltimateRenderer,
  aatrox: aatroxUltimateRenderer,
  viego: viegoUltimateRenderer,
  makima: makimaUltimateRenderer,
  roy: royUltimateRenderer,
  gray: grayUltimateRenderer,
  erza: erzaUltimateRenderer,
  lucy_ft: lucyFtUltimateRenderer,
  laxus: laxusUltimateRenderer,
  gajeel: gajeelUltimateRenderer,
  wendy: wendyUltimateRenderer,
  jellal: jellalUltimateRenderer,
  mirajane: mirajaneUltimateRenderer,
  gildarts: gildartsUltimateRenderer,
  zeref: zerefUltimateRenderer,
  acnologia: acnologiaUltimateRenderer,
  juvia: juviaUltimateRenderer,
  sting: stingUltimateRenderer,
  rogue_ft: rogueFtUltimateRenderer,
  alex: alexUltimateRenderer,
  enderman: endermanUltimateRenderer,
  blaze: blazeUltimateRenderer,
  irongolem: ironGolemUltimateRenderer,
  skeleton: skeletonUltimateRenderer,
  zombie: zombieUltimateRenderer,
  piglin: piglinUltimateRenderer,
  ghast: ghastUltimateRenderer,
  shulker: shulkerUltimateRenderer,
  technoblade: technobladeUltimateRenderer,
  evoker: evokerUltimateRenderer,
  ravager: ravagerUltimateRenderer,
  genos: genosUltimateRenderer,
  garou: garouUltimateRenderer,
  tatsumaki: tatsumakiUltimateRenderer,
  boros: borosUltimateRenderer,
  bang: bangUltimateRenderer,
  flashyflash: flashyflashUltimateRenderer,
  atomic: atomicUltimateRenderer,
  king_opm: kingOpmUltimateRenderer,
  sonic_opm: sonicOpmUltimateRenderer,
  fubuki: fubukiUltimateRenderer,
  metalbat: metalbatUltimateRenderer,
  zombieman: zombiemanUltimateRenderer,
  watchdog: watchdogUltimateRenderer,
  orochi_opm: orochiOpmUltimateRenderer,
  igris: igrisUltimateRenderer,
  beru: beruUltimateRenderer,
  bellion: bellionUltimateRenderer,
  tusk_sl: tuskSlUltimateRenderer,
  iron_sl: ironSlUltimateRenderer,
  cha_haein: chaHaeInUltimateRenderer,
  thomas_andre: thomasAndreUltimateRenderer,
  liu_zhigang: liuZhigangUltimateRenderer,
  go_gunhee: goGunheeUltimateRenderer,
  baek_yunho: baekYunhoUltimateRenderer,
  choi_jongin: choiJongInUltimateRenderer,
  antares: antaresUltimateRenderer,
  ashborn: ashbornUltimateRenderer,
  mikasa: mikasaUltimateRenderer,
  armin: arminUltimateRenderer,
  reiner: reinerUltimateRenderer,
  annie: annieUltimateRenderer,
  zeke: zekeUltimateRenderer,
  erwin: erwinUltimateRenderer,
  hange: hangeUltimateRenderer,
  jean: jeanUltimateRenderer,
  sasha: sashaUltimateRenderer,
  connie: connieUltimateRenderer,
  porco: porcoUltimateRenderer,
  lara: laraUltimateRenderer,
  papyrus: papyrusUltimateRenderer,
  undyne: undyneUltimateRenderer,
  chara: charaUltimateRenderer,
  jevil: jevilUltimateRenderer,
  raiden: raidenUltimateRenderer,
  zhongli: zhongliUltimateRenderer,
  hutao: hutaoUltimateRenderer,
  scorpion: scorpionUltimateRenderer,
  subzero: subzeroUltimateRenderer,
  mario: marioUltimateRenderer,
  link: linkUltimateRenderer,
  kirby: kirbyUltimateRenderer,
  cloud: cloudUltimateRenderer,
  lux: luxUltimateRenderer,
  ezreal: ezrealUltimateRenderer,
  akali: akaliUltimateRenderer,
  leesin: leeSinUltimateRenderer,
  teemo: teemoUltimateRenderer,
  thresh: threshUltimateRenderer,
  ekko: ekkoUltimateRenderer,
  katarina: katarinaUltimateRenderer,
  riven: rivenUltimateRenderer,
  sett: settUltimateRenderer,
  sylas: sylasUltimateRenderer,
  kayn: kaynUltimateRenderer,
  volibear: volibearUltimateRenderer,
  choso: chosoUltimateRenderer,
  boa: boaUltimateRenderer,
  sabo: saboUltimateRenderer,
  bigmom: bigmomUltimateRenderer,
  yamato_op: yamatoOpUltimateRenderer,
  marco: marcoUltimateRenderer,
  nezuko: nezukoUltimateRenderer,
  inosuke: inosukeUltimateRenderer,
  mitsuri: mitsuriUltimateRenderer,
  muichiro: muichiroUltimateRenderer,
  doma: domaUltimateRenderer,
  buu: buuUltimateRenderer,
  trunks: trunksUltimateRenderer,
  piccolo: piccoloUltimateRenderer,
  hit: hitUltimateRenderer,
  bardock: bardockUltimateRenderer,
  android17: android17UltimateRenderer,
  android18: android18UltimateRenderer,
  king_sds: kingSdsUltimateRenderer,
  diane: dianeUltimateRenderer,
  merlin_sds: merlinSdsUltimateRenderer,
  gowther: gowtherUltimateRenderer,
  estarossa: estarossaUltimateRenderer,
  zeldris: zeldrisUltimateRenderer,
  tobirama: tobiramaUltimateRenderer,
  tsunade: tsunadeUltimateRenderer,
  orochimaru: orochimaruUltimateRenderer,
  deidara: deidaraUltimateRenderer,
  kisame: kisameUltimateRenderer,
  killerbee: killerbeeUltimateRenderer,
  renji: renjiUltimateRenderer,
  grimmjow: grimmjowUltimateRenderer,
  starrk: starrkUltimateRenderer,
  yoruichi: yoruichiUltimateRenderer,
  shunsui: shunsuiUltimateRenderer,
  mayuri: mayuriUltimateRenderer,
  kurapika: kurapikaUltimateRenderer,
  leorio: leorioUltimateRenderer,
  chrollo: chrolloUltimateRenderer,
  feitan: feitanUltimateRenderer,
  illumi: illumiUltimateRenderer,
  pitou: pitouUltimateRenderer,
  youpi: youpiUltimateRenderer,
  pouf: poufUltimateRenderer,
  kite: kiteUltimateRenderer,
  bisky: biskyUltimateRenderer,
  power: powerUltimateRenderer,
  aki: akiUltimateRenderer,
  reze: rezeUltimateRenderer,
  quanxi: quanxiUltimateRenderer,
  kishibe: kishibeUltimateRenderer,
  kobeni: kobeniUltimateRenderer,
  angel_csm: angelCsmUltimateRenderer,
  beam_csm: beamCsmUltimateRenderer,
  katana_man: katanaManUltimateRenderer,
  santa_csm: santaCsmUltimateRenderer,
  yoru: yoruUltimateRenderer,
  darkness_devil: darknessDevilUltimateRenderer,
  edward: edwardUltimateRenderer,
  alphonse: alphonseUltimateRenderer,
  scar_fma: scarFmaUltimateRenderer,
  kingbradley: kingBradleyUltimateRenderer,
  greedling: greedlingUltimateRenderer,
  envy_fma: envyFmaUltimateRenderer,
  lust_fma: lustFmaUltimateRenderer,
  gluttony_fma: gluttonyFmaUltimateRenderer,
  pride_fma: prideFmaUltimateRenderer,
  sloth_fma: slothFmaUltimateRenderer,
  father_fma: fatherFmaUltimateRenderer,
  armstrong: armstrongUltimateRenderer,
  olivier: olivierUltimateRenderer,
  hohenheim: hohenheimUltimateRenderer,
  allforone: allForOneUltimateRenderer,
  toga: togaUltimateRenderer,
  hawks: hawksUltimateRenderer,
  mirio: mirioUltimateRenderer,
  uraraka: urarakaUltimateRenderer,
  iida: iidaUltimateRenderer,
  kirishima: kirishimaUltimateRenderer,
  tokoyami: tokoyamiUltimateRenderer,
  josuke: josukeUltimateRenderer,
  joseph: josephUltimateRenderer,
  jonathan: jonathanUltimateRenderer,
  jolyne: jolyneUltimateRenderer,
  kira: kiraUltimateRenderer,
  diavolo: diavoloUltimateRenderer,
  pucci: pucciUltimateRenderer,
  kars: karsUltimateRenderer,
  polnareff: polnareffUltimateRenderer,
  kakyoin: kakyoinUltimateRenderer,
  bruno: brunoUltimateRenderer,
  rohan: rohanUltimateRenderer,
  yuno: yunoUltimateRenderer,
  yami: yamiUltimateRenderer,
  noelle: noelleUltimateRenderer,
  julius: juliusUltimateRenderer,
  mereoleona: mereoleonaUltimateRenderer,
  luck: luckUltimateRenderer,
  magna: magnaUltimateRenderer,
  nacht: nachtUltimateRenderer,
  licht: lichtUltimateRenderer,
  zenon: zenonUltimateRenderer,
  dante_bc: danteBcUltimateRenderer,
  vanica: vanicaUltimateRenderer,
  lucius: luciusUltimateRenderer,
  shirou: shirouUltimateRenderer,
  rin_tohsaka: rinTohsakaUltimateRenderer,
  lancer_cu: lancerCuUltimateRenderer,
  rider_medusa: riderMedusaUltimateRenderer,
  berserker_herc: berserkerHercUltimateRenderer,
  karna: karnaUltimateRenderer,
  arjuna: arjunaUltimateRenderer,
  iskandar: iskandarUltimateRenderer,
  scathach: scathachUltimateRenderer,
  jeanne: jeanneUltimateRenderer,
  jalter: jalterUltimateRenderer,
  enkidu: enkiduUltimateRenderer,
  stonks_man: stonksManUltimateRenderer,
  pop_cat: popCatUltimateRenderer,
  ricardo_milos: ricardoMilosUltimateRenderer,
  bing_chilling: bingChillingUltimateRenderer,
};

export function drawCustomUltimateBackdrops(
  ctx: CanvasRenderingContext2D,
  ultimates: ActiveUltimateState[],
  bounds: ArenaBounds,
  fighters: FighterState[],
  t: number,
): void {
  for (const st of ultimates) {
    ULTIMATE_RENDERERS[st.characterId]?.drawBackdrop?.(ctx, st, bounds, fighters, t);
  }
}

export function drawArenaObstacles(
  ctx: CanvasRenderingContext2D,
  obstacles: ArenaObstacle[],
  t: number,
): void {
  for (const obs of obstacles) {
    if (obs.kind === 'obsidian-block' || obs.kind === 'bedrock-block') {
      drawMinecraftObstacle(ctx, obs, t);
    } else if (
      obs.kind === 'iron-ore' ||
      obs.kind === 'diamond-ore' ||
      obs.kind === 'ancient-debris'
    ) {
      const halfW = obs.w * 0.5;
      const halfH = obs.h * 0.5;
      const pulse = 0.72 + Math.sin(t * 6) * 0.28;
      ctx.save();
      ctx.translate(obs.x, obs.y);
      ctx.fillStyle = obs.kind === 'ancient-debris' ? '#451a03' : '#57534e';
      ctx.strokeStyle = obs.secondaryColor || '#facc15';
      ctx.lineWidth = 2.4;
      ctx.shadowColor = obs.secondaryColor || '#22d3ee';
      ctx.shadowBlur = 10 * pulse;
      ctx.fillRect(-halfW, -halfH, obs.w, obs.h);
      ctx.strokeRect(-halfW, -halfH, obs.w, obs.h);
      ctx.shadowBlur = 0;

      // Pixelated Minecraft ore veins
      ctx.fillStyle = obs.color;
      const s = Math.max(3, Math.round(obs.w * 0.16));
      const specks: Array<[number, number]> =
        obs.kind === 'ancient-debris'
          ? [
              [-s * 1.4, -s * 1.1],
              [0, -s * 1.1],
              [s * 1.1, -s * 0.3],
              [-s * 0.8, s * 0.4],
              [s * 0.5, s * 0.9],
            ]
          : [
              [-s * 1.5, -s * 1.2],
              [s * 0.6, -s * 1.4],
              [-s * 0.3, -s * 0.1],
              [s * 1.1, s * 0.5],
              [-s * 1.2, s * 1.0],
            ];
      for (const [ox, oy] of specks) {
        ctx.fillRect(ox, oy, s, s);
      }
      ctx.restore();
    } else if (obs.kind === 'stone-meteor') {
      const r = obs.w * 0.5;
      ctx.save();
      ctx.translate(obs.x, obs.y);
      ctx.fillStyle = '#44403c';
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#ea580c';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI * 2) / 8;
        const rad = r * (i % 2 === 0 ? 1.04 : 0.88);
        const px = Math.cos(a) * rad;
        const py = Math.sin(a) * rad;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Glowing magma fissures
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-r * 0.45, -r * 0.25);
      ctx.lineTo(0, 0);
      ctx.lineTo(r * 0.42, r * 0.3);
      ctx.moveTo(0, 0);
      ctx.lineTo(-r * 0.25, r * 0.5);
      ctx.stroke();
      ctx.restore();
    } else {
      const halfW = obs.w * 0.5;
      const halfH = obs.h * 0.5;
      ctx.save();
      ctx.translate(obs.x, obs.y);
      ctx.fillStyle = obs.color;
      ctx.strokeStyle = obs.secondaryColor || '#ffffff';
      ctx.lineWidth = 2.2;
      ctx.fillRect(-halfW, -halfH, obs.w, obs.h);
      ctx.strokeRect(-halfW, -halfH, obs.w, obs.h);
      ctx.restore();
    }
  }
}

export function drawCustomUltimateForegrounds(
  ctx: CanvasRenderingContext2D,
  ultimates: ActiveUltimateState[],
  bounds: ArenaBounds,
  fighters: FighterState[],
  t: number,
): void {
  for (const st of ultimates) {
    ULTIMATE_RENDERERS[st.characterId]?.drawForeground?.(ctx, st, bounds, fighters, t);
  }
}

/** Draws top-center active banners for custom Ultimates (cleanly stacked below any legacy Domain banners!) */
export function drawCustomUltimateBanners(
  ctx: CanvasRenderingContext2D,
  ultimates: ActiveUltimateState[],
  bounds: ArenaBounds,
  verticalOffsetCount: number,
): void {
  if (ultimates.length === 0) return;
  const full = bounds.fullSize;

  ultimates.forEach((st, idx) => {
    const ratio = Math.max(0, Math.min(1, 1 - st.elapsed / Math.max(0.01, st.duration)));
    const y = 16 + (verticalOffsetCount + idx) * 42;
    const barW = Math.min(full - 44, 430);
    const x = (full - barW) / 2;

    ctx.save();
    ctx.fillStyle = 'rgba(4, 7, 17, 0.88)';
    ctx.strokeStyle = st.bannerColor;
    ctx.lineWidth = 1.8;
    ctx.shadowColor = st.bannerColor;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.roundRect(x, y, barW, 34, 8);
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.fillStyle = st.bannerColor;
    ctx.fillRect(x + 6, y + 29, (barW - 12) * ratio, 3);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 11.5px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`「${st.title}」`, full / 2, y + 12, barW - 20);

    ctx.font = '700 9.2px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(st.subtitle, full / 2, y + 23, barW - 20);
    ctx.restore();
  });
}
