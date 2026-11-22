import type { ActiveUltimateState, FighterState } from '../../types/game';
import type { AbilityContext } from '../abilities';
import { aceUltimateHandler } from './ace';
import { ahriUltimateHandler } from './ahri';
import { aizenUltimateHandler } from './aizen';
import { akainuUltimateHandler } from './akainu';
import { akazaUltimateHandler } from './akaza';
import { allmightUltimateHandler } from './allmight';
import { aokijiUltimateHandler } from './aokiji';
import { archerEmiyaUltimateHandler } from './archer_emiya';
import { astaUltimateHandler } from './asta';
import { bakugoUltimateHandler } from './bakugo';
import { banUltimateHandler } from './ban';
import { beerusUltimateHandler } from './beerus';
import { blackbeardUltimateHandler } from './blackbeard';
import { brolyUltimateHandler } from './broly';
import { byakuyaUltimateHandler } from './byakuya';
import { cellUltimateHandler } from './cell';
import { creeperUltimateHandler } from './creeper';
import { dekuUltimateHandler } from './deku';
import { denjiUltimateHandler } from './denji';
import { dioUltimateHandler } from './dio';
import { doflamingoUltimateHandler } from './doflamingo';
import { entity303UltimateHandler } from './entity303';
import { erenUltimateHandler } from './eren';
import { escanorUltimateHandler } from './escanor';
import { frierenUltimateHandler } from './frieren';
import { friezaUltimateHandler } from './frieza';
import { gaaraUltimateHandler } from './gaara';
import { getoUltimateHandler } from './geto';
import { gilgameshUltimateHandler } from './gilgamesh';
import { giornoUltimateHandler } from './giorno';
import { giyuUltimateHandler } from './giyu';
import { gohanUltimateHandler } from './gohan';
import { gojoUltimateHandler } from './gojo';
import { gokuUltimateHandler } from './goku';
import { gonUltimateHandler } from './gon';
import { guyUltimateHandler } from './guy';
import { hakariUltimateHandler } from './hakari';
import { hashiramaUltimateHandler } from './hashirama';
import { herobrineUltimateHandler } from './herobrine';
import { hisokaUltimateHandler } from './hisoka';
import { ichigoUltimateHandler } from './ichigo';
import { itachiUltimateHandler } from './itachi';
import { jinwooUltimateHandler } from './jinwoo';
import { jinxUltimateHandler } from './jinx';
import { jiraiyaUltimateHandler } from './jiraiya';
import { jirenUltimateHandler } from './jiren';
import { jotaroUltimateHandler } from './jotaro';
import { kaidoUltimateHandler } from './kaido';
import { kakashiUltimateHandler } from './kakashi';
import { kashimoUltimateHandler } from './kashimo';
import { katakuriUltimateHandler } from './katakuri';
import { kenpachiUltimateHandler } from './kenpachi';
import { killuaUltimateHandler } from './killua';
import { kizaruUltimateHandler } from './kizaru';
import { kokushiboUltimateHandler } from './kokushibo';
import { kratosUltimateHandler } from './kratos';
import { lawUltimateHandler } from './law';
import { leviUltimateHandler } from './levi';
import { luffyUltimateHandler } from './luffy';
import { madaraUltimateHandler } from './madara';
import { mahitoUltimateHandler } from './mahito';
import { mahoragaUltimateHandler } from './mahoraga';
import { makiUltimateHandler } from './maki';
import { megumiUltimateHandler } from './megumi';
import { meliodasUltimateHandler } from './meliodas';
import { meruemUltimateHandler } from './meruem';
import { mihawkUltimateHandler } from './mihawk';
import { minatoUltimateHandler } from './minato';
import { mobUltimateHandler } from './mob';
import { muzanUltimateHandler } from './muzan';
import { nanamiUltimateHandler } from './nanami';
import { narutoUltimateHandler } from './naruto';
import { nobaraUltimateHandler } from './nobara';
import { obitoUltimateHandler } from './obito';
import { painUltimateHandler } from './pain';
import { pikachuUltimateHandler } from './pikachu';
import { rengokuUltimateHandler } from './rengoku';
import { rimuruUltimateHandler } from './rimuru';
import { rukiaUltimateHandler } from './rukia';
import { saberUltimateHandler } from './saber';
import { saitamaUltimateHandler } from './saitama';
import { sanjiUltimateHandler } from './sanji';
import { sansUltimateHandler } from './sans';
import { sasukeUltimateHandler } from './sasuke';
import { shanksUltimateHandler } from './shanks';
import { shigarakiUltimateHandler } from './shigaraki';
import { sonicUltimateHandler } from './sonic';
import { steveUltimateHandler } from './steve';
import { sukunaUltimateHandler } from './sukuna';
import { tanjiroUltimateHandler } from './tanjiro';
import { tengenUltimateHandler } from './tengen';
import { todoUltimateHandler } from './todo';
import { todorokiUltimateHandler } from './todoroki';
import { tojiUltimateHandler } from './toji';
import { toshiroUltimateHandler } from './toshiro';
import type { UltimateHandler } from './types';
import { ulquiorraUltimateHandler } from './ulquiorra';
import { uraharaUltimateHandler } from './urahara';
import { vegetaUltimateHandler } from './vegeta';
import { vergilUltimateHandler } from './vergil';
import { wardenUltimateHandler } from './warden';
import { whitebeardUltimateHandler } from './whitebeard';
import { witherUltimateHandler } from './wither';
import { yamamotoUltimateHandler } from './yamamoto';
import { yasuoUltimateHandler } from './yasuo';
import { yhwachUltimateHandler } from './yhwach';
import { yujiUltimateHandler } from './yuji';
import { yutaUltimateHandler } from './yuta';
import { zenitsuUltimateHandler } from './zenitsu';
import { zoroUltimateHandler } from './zoro';
import { dariusUltimateHandler } from './darius';
import { gogetaUltimateHandler } from './gogeta';
import { gokuBlackUltimateHandler } from './gokublack';
import { jogoUltimateHandler } from './jogo';
import { mordekaiserUltimateHandler } from './mordekaiser';
import { natsuUltimateHandler } from './natsu';
import { neteroUltimateHandler } from './netero';
import { vegitoUltimateHandler } from './vegito';
import { yoneUltimateHandler } from './yone';
import { zedUltimateHandler } from './zed';
import { aatroxUltimateHandler } from './aatrox';
import { dabiUltimateHandler } from './dabi';
import { endeavorUltimateHandler } from './endeavor';
import { garenUltimateHandler } from './garen';
import { gyomeiUltimateHandler } from './gyomei';
import { makimaUltimateHandler } from './makima';
import { royUltimateHandler } from './roy';
import { sanemiUltimateHandler } from './sanemi';
import { shinobuUltimateHandler } from './shinobu';
import { viegoUltimateHandler } from './viego';
import { acnologiaUltimateHandler } from './acnologia';
import { erzaUltimateHandler } from './erza';
import { gajeelUltimateHandler } from './gajeel';
import { gildartsUltimateHandler } from './gildarts';
import { grayUltimateHandler } from './gray';
import { jellalUltimateHandler } from './jellal';
import { juviaUltimateHandler } from './juvia';
import { laxusUltimateHandler } from './laxus';
import { lucyFtUltimateHandler } from './lucy_ft';
import { mirajaneUltimateHandler } from './mirajane';
import { rogueFtUltimateHandler } from './rogue_ft';
import { stingUltimateHandler } from './sting';
import { wendyUltimateHandler } from './wendy';
import { zerefUltimateHandler } from './zeref';
import { alexUltimateHandler } from './alex';
import { blazeUltimateHandler } from './blaze';
import { endermanUltimateHandler } from './enderman';
import { evokerUltimateHandler } from './evoker';
import { ghastUltimateHandler } from './ghast';
import { ironGolemUltimateHandler } from './irongolem';
import { piglinUltimateHandler } from './piglin';
import { ravagerUltimateHandler } from './ravager';
import { shulkerUltimateHandler } from './shulker';
import { skeletonUltimateHandler } from './skeleton';
import { technobladeUltimateHandler } from './technoblade';
import { zombieUltimateHandler } from './zombie';
import { atomicUltimateHandler } from './atomic';
import { bangUltimateHandler } from './bang';
import { borosUltimateHandler } from './boros';
import { flashyflashUltimateHandler } from './flashyflash';
import { fubukiUltimateHandler } from './fubuki';
import { garouUltimateHandler } from './garou';
import { genosUltimateHandler } from './genos';
import { kingOpmUltimateHandler } from './king_opm';
import { metalbatUltimateHandler } from './metalbat';
import { orochiOpmUltimateHandler } from './orochi_opm';
import { sonicOpmUltimateHandler } from './sonic_opm';
import { tatsumakiUltimateHandler } from './tatsumaki';
import { watchdogUltimateHandler } from './watchdog';
import { zombiemanUltimateHandler } from './zombieman';
import { antaresUltimateHandler } from './antares';
import { ashbornUltimateHandler } from './ashborn';
import { baekYunhoUltimateHandler } from './baek_yunho';
import { bellionUltimateHandler } from './bellion';
import { beruUltimateHandler } from './beru';
import { chaHaeInUltimateHandler } from './cha_haein';
import { choiJongInUltimateHandler } from './choi_jongin';
import { goGunheeUltimateHandler } from './go_gunhee';
import { igrisUltimateHandler } from './igris';
import { ironSlUltimateHandler } from './iron_sl';
import { liuZhigangUltimateHandler } from './liu_zhigang';
import { thomasAndreUltimateHandler } from './thomas_andre';
import { tuskSlUltimateHandler } from './tusk_sl';
import { annieUltimateHandler } from './annie';
import { arminUltimateHandler } from './armin';
import { connieUltimateHandler } from './connie';
import { erwinUltimateHandler } from './erwin';
import { hangeUltimateHandler } from './hange';
import { jeanUltimateHandler } from './jean';
import { laraUltimateHandler } from './lara';
import { mikasaUltimateHandler } from './mikasa';
import { porcoUltimateHandler } from './porco';
import { reinerUltimateHandler } from './reiner';
import { sashaUltimateHandler } from './sasha';
import { zekeUltimateHandler } from './zeke';
import { charaUltimateHandler } from './chara';
import { cloudUltimateHandler } from './cloud';
import { hutaoUltimateHandler } from './hutao';
import { jevilUltimateHandler } from './jevil';
import { kirbyUltimateHandler } from './kirby';
import { linkUltimateHandler } from './link';
import { marioUltimateHandler } from './mario';
import { papyrusUltimateHandler } from './papyrus';
import { raidenUltimateHandler } from './raiden';
import { scorpionUltimateHandler } from './scorpion';
import { subzeroUltimateHandler } from './subzero';
import { undyneUltimateHandler } from './undyne';
import { zhongliUltimateHandler } from './zhongli';
import { akaliUltimateHandler } from './akali';
import { ekkoUltimateHandler } from './ekko';
import { ezrealUltimateHandler } from './ezreal';
import { katarinaUltimateHandler } from './katarina';
import { kaynUltimateHandler } from './kayn';
import { leeSinUltimateHandler } from './leesin';
import { luxUltimateHandler } from './lux';
import { rivenUltimateHandler } from './riven';
import { settUltimateHandler } from './sett';
import { sylasUltimateHandler } from './sylas';
import { teemoUltimateHandler } from './teemo';
import { threshUltimateHandler } from './thresh';
import { volibearUltimateHandler } from './volibear';
import { bigmomUltimateHandler } from './bigmom';
import { boaUltimateHandler } from './boa';
import { chosoUltimateHandler } from './choso';
import { domaUltimateHandler } from './doma';
import { inosukeUltimateHandler } from './inosuke';
import { marcoUltimateHandler } from './marco';
import { mitsuriUltimateHandler } from './mitsuri';
import { muichiroUltimateHandler } from './muichiro';
import { nezukoUltimateHandler } from './nezuko';
import { saboUltimateHandler } from './sabo';
import { yamatoOpUltimateHandler } from './yamato_op';
import { android17UltimateHandler } from './android17';
import { android18UltimateHandler } from './android18';
import { bardockUltimateHandler } from './bardock';
import { buuUltimateHandler } from './buu';
import { dianeUltimateHandler } from './diane';
import { estarossaUltimateHandler } from './estarossa';
import { gowtherUltimateHandler } from './gowther';
import { hitUltimateHandler } from './hit';
import { kingSdsUltimateHandler } from './king_sds';
import { merlinSdsUltimateHandler } from './merlin_sds';
import { piccoloUltimateHandler } from './piccolo';
import { trunksUltimateHandler } from './trunks';
import { zeldrisUltimateHandler } from './zeldris';
import { deidaraUltimateHandler } from './deidara';
import { grimmjowUltimateHandler } from './grimmjow';
import { killerbeeUltimateHandler } from './killerbee';
import { kisameUltimateHandler } from './kisame';
import { mayuriUltimateHandler } from './mayuri';
import { orochimaruUltimateHandler } from './orochimaru';
import { renjiUltimateHandler } from './renji';
import { shunsuiUltimateHandler } from './shunsui';
import { starrkUltimateHandler } from './starrk';
import { tobiramaUltimateHandler } from './tobirama';
import { tsunadeUltimateHandler } from './tsunade';
import { yoruichiUltimateHandler } from './yoruichi';
import { biskyUltimateHandler } from './bisky';
import { chrolloUltimateHandler } from './chrollo';
import { feitanUltimateHandler } from './feitan';
import { illumiUltimateHandler } from './illumi';
import { kiteUltimateHandler } from './kite';
import { kurapikaUltimateHandler } from './kurapika';
import { leorioUltimateHandler } from './leorio';
import { pitouUltimateHandler } from './pitou';
import { poufUltimateHandler } from './pouf';
import { youpiUltimateHandler } from './youpi';
import { akiUltimateHandler } from './aki';
import { angelCsmUltimateHandler } from './angel_csm';
import { beamCsmUltimateHandler } from './beam_csm';
import { darknessDevilUltimateHandler } from './darkness_devil';
import { katanaManUltimateHandler } from './katana_man';
import { kishibeUltimateHandler } from './kishibe';
import { kobeniUltimateHandler } from './kobeni';
import { powerUltimateHandler } from './power';
import { quanxiUltimateHandler } from './quanxi';
import { rezeUltimateHandler } from './reze';
import { santaCsmUltimateHandler } from './santa_csm';
import { yoruUltimateHandler } from './yoru';
import { alphonseUltimateHandler } from './alphonse';
import { armstrongUltimateHandler } from './armstrong';
import { edwardUltimateHandler } from './edward';
import { envyFmaUltimateHandler } from './envy_fma';
import { fatherFmaUltimateHandler } from './father_fma';
import { gluttonyFmaUltimateHandler } from './gluttony_fma';
import { greedlingUltimateHandler } from './greedling';
import { hohenheimUltimateHandler } from './hohenheim';
import { kingBradleyUltimateHandler } from './kingbradley';
import { lustFmaUltimateHandler } from './lust_fma';
import { olivierUltimateHandler } from './olivier';
import { prideFmaUltimateHandler } from './pride_fma';
import { scarFmaUltimateHandler } from './scar_fma';
import { slothFmaUltimateHandler } from './sloth_fma';
import { allForOneUltimateHandler } from './allforone';
import { hawksUltimateHandler } from './hawks';
import { iidaUltimateHandler } from './iida';
import { kirishimaUltimateHandler } from './kirishima';
import { mirioUltimateHandler } from './mirio';
import { togaUltimateHandler } from './toga';
import { tokoyamiUltimateHandler } from './tokoyami';
import { urarakaUltimateHandler } from './uraraka';
import { brunoUltimateHandler } from './bruno';
import { diavoloUltimateHandler } from './diavolo';
import { jolyneUltimateHandler } from './jolyne';
import { jonathanUltimateHandler } from './jonathan';
import { josephUltimateHandler } from './joseph';
import { josukeUltimateHandler } from './josuke';
import { kakyoinUltimateHandler } from './kakyoin';
import { karsUltimateHandler } from './kars';
import { kiraUltimateHandler } from './kira';
import { polnareffUltimateHandler } from './polnareff';
import { pucciUltimateHandler } from './pucci';
import { rohanUltimateHandler } from './rohan';
import { danteBcUltimateHandler } from './dante_bc';
import { juliusUltimateHandler } from './julius';
import { lichtUltimateHandler } from './licht';
import { luciusUltimateHandler } from './lucius';
import { luckUltimateHandler } from './luck';
import { magnaUltimateHandler } from './magna';
import { mereoleonaUltimateHandler } from './mereoleona';
import { nachtUltimateHandler } from './nacht';
import { noelleUltimateHandler } from './noelle';
import { vanicaUltimateHandler } from './vanica';
import { yamiUltimateHandler } from './yami';
import { yunoUltimateHandler } from './yuno';
import { zenonUltimateHandler } from './zenon';
import { arjunaUltimateHandler } from './arjuna';
import { berserkerHercUltimateHandler } from './berserker_herc';
import { enkiduUltimateHandler } from './enkidu';
import { iskandarUltimateHandler } from './iskandar';
import { jalterUltimateHandler } from './jalter';
import { jeanneUltimateHandler } from './jeanne';
import { karnaUltimateHandler } from './karna';
import { lancerCuUltimateHandler } from './lancer_cu';
import { riderMedusaUltimateHandler } from './rider_medusa';
import { rinTohsakaUltimateHandler } from './rin_tohsaka';
import { scathachUltimateHandler } from './scathach';
import { shirouUltimateHandler } from './shirou';
import { bingChillingUltimateHandler } from './bing_chilling';
import { popCatUltimateHandler } from './pop_cat';
import { ricardoMilosUltimateHandler } from './ricardo_milos';
import { stonksManUltimateHandler } from './stonks_man';

/**
 * Modular per-character Ultimate Registry (Anti-Reskin Architecture).
 * Each upgraded character owns an isolated physics handler file in `src/physics/ultimates/<id>.ts`.
 */
export const ULTIMATE_HANDLERS: Readonly<Record<string, UltimateHandler>> = {
  // Batch 1: Minecraft Core 4
  steve: steveUltimateHandler,
  herobrine: herobrineUltimateHandler,
  entity303: entity303UltimateHandler,
  warden: wardenUltimateHandler,
  // Batch 2: Minecraft Monsters, Undertale & Pokémon
  wither: witherUltimateHandler,
  creeper: creeperUltimateHandler,
  sans: sansUltimateHandler,
  pikachu: pikachuUltimateHandler,
  // Batch 3 (10-Character Mega-Batch): LoL, DMC, Sonic, GoW, One Piece, DBZ, Naruto
  yasuo: yasuoUltimateHandler,
  ahri: ahriUltimateHandler,
  jinx: jinxUltimateHandler,
  vergil: vergilUltimateHandler,
  sonic: sonicUltimateHandler,
  kratos: kratosUltimateHandler,
  luffy: luffyUltimateHandler,
  goku: gokuUltimateHandler,
  naruto: narutoUltimateHandler,
  sasuke: sasukeUltimateHandler,
  // Batch 4 (10-Character Mega-Batch): Zoro, Ichigo, Tanjiro, Saitama, Levi, Eren, Jinwoo, Denji, Vegeta, Killua
  zoro: zoroUltimateHandler,
  ichigo: ichigoUltimateHandler,
  tanjiro: tanjiroUltimateHandler,
  saitama: saitamaUltimateHandler,
  levi: leviUltimateHandler,
  eren: erenUltimateHandler,
  jinwoo: jinwooUltimateHandler,
  denji: denjiUltimateHandler,
  vegeta: vegetaUltimateHandler,
  killua: killuaUltimateHandler,
  // Batch 5 (10-Character Mega-Batch): Final 6 Core (Madara, Deku, Rimuru, Asta, Frieren, Mob) + 4 Pillar Domains (Gojo, Sukuna, DIO, Law)
  madara: madaraUltimateHandler,
  deku: dekuUltimateHandler,
  rimuru: rimuruUltimateHandler,
  asta: astaUltimateHandler,
  frieren: frierenUltimateHandler,
  mob: mobUltimateHandler,
  gojo: gojoUltimateHandler,
  sukuna: sukunaUltimateHandler,
  dio: dioUltimateHandler,
  law: lawUltimateHandler,
  // Batch 6 (10-Character Mega-Batch): Shanks, Kaido, Itachi, Minato, Yuta, Hakari, Gilgamesh, Saber, Escanor, Meliodas
  shanks: shanksUltimateHandler,
  kaido: kaidoUltimateHandler,
  itachi: itachiUltimateHandler,
  minato: minatoUltimateHandler,
  yuta: yutaUltimateHandler,
  hakari: hakariUltimateHandler,
  gilgamesh: gilgameshUltimateHandler,
  saber: saberUltimateHandler,
  escanor: escanorUltimateHandler,
  meliodas: meliodasUltimateHandler,
  // Batch 7 (10-Character Mega-Batch): Ace, Whitebeard, Sanji, Kakashi, Pain, Obito, Toji, Kashimo, Ban, Archer EMIYA
  ace: aceUltimateHandler,
  whitebeard: whitebeardUltimateHandler,
  sanji: sanjiUltimateHandler,
  kakashi: kakashiUltimateHandler,
  pain: painUltimateHandler,
  obito: obitoUltimateHandler,
  toji: tojiUltimateHandler,
  kashimo: kashimoUltimateHandler,
  ban: banUltimateHandler,
  archer_emiya: archerEmiyaUltimateHandler,
  // Batch 8 (10-Character Mega-Batch): Gaara, Jiraiya, Guy, Hashirama, Megumi, Aizen, Yamamoto, Kenpachi, Zenitsu, Rengoku
  gaara: gaaraUltimateHandler,
  jiraiya: jiraiyaUltimateHandler,
  guy: guyUltimateHandler,
  hashirama: hashiramaUltimateHandler,
  megumi: megumiUltimateHandler,
  aizen: aizenUltimateHandler,
  yamamoto: yamamotoUltimateHandler,
  kenpachi: kenpachiUltimateHandler,
  zenitsu: zenitsuUltimateHandler,
  rengoku: rengokuUltimateHandler,
  // Batch 9 (10-Character Mega-Batch): Yuji, Nobara, Todo, Nanami, Maki, Geto, Yhwach, Byakuya, Ulquiorra, Urahara
  yuji: yujiUltimateHandler,
  nobara: nobaraUltimateHandler,
  todo: todoUltimateHandler,
  nanami: nanamiUltimateHandler,
  maki: makiUltimateHandler,
  geto: getoUltimateHandler,
  yhwach: yhwachUltimateHandler,
  byakuya: byakuyaUltimateHandler,
  ulquiorra: ulquiorraUltimateHandler,
  urahara: uraharaUltimateHandler,
  // Batch 10 (10-Character Mega-Batch): Jotaro, Giorno, Frieza, Broly, Gohan, Beerus, Doflamingo, Katakuri, Akaza, Kokushibo
  jotaro: jotaroUltimateHandler,
  giorno: giornoUltimateHandler,
  frieza: friezaUltimateHandler,
  broly: brolyUltimateHandler,
  gohan: gohanUltimateHandler,
  beerus: beerusUltimateHandler,
  doflamingo: doflamingoUltimateHandler,
  katakuri: katakuriUltimateHandler,
  akaza: akazaUltimateHandler,
  kokushibo: kokushiboUltimateHandler,
  // Batch 11 (10-Character Mega-Batch): Blackbeard, Mihawk, Cell, Jiren, Gon, Hisoka, Meruem, Muzan, Giyu, Tengen
  blackbeard: blackbeardUltimateHandler,
  mihawk: mihawkUltimateHandler,
  cell: cellUltimateHandler,
  jiren: jirenUltimateHandler,
  gon: gonUltimateHandler,
  hisoka: hisokaUltimateHandler,
  meruem: meruemUltimateHandler,
  muzan: muzanUltimateHandler,
  giyu: giyuUltimateHandler,
  tengen: tengenUltimateHandler,
  // Batch 12 (10-Character Mega-Batch): Bakugo, Todoroki, All Might, Shigaraki, Akainu, Kizaru, Aokiji, Toshiro, Rukia, Mahito
  bakugo: bakugoUltimateHandler,
  todoroki: todorokiUltimateHandler,
  allmight: allmightUltimateHandler,
  shigaraki: shigarakiUltimateHandler,
  akainu: akainuUltimateHandler,
  kizaru: kizaruUltimateHandler,
  aokiji: aokijiUltimateHandler,
  toshiro: toshiroUltimateHandler,
  rukia: rukiaUltimateHandler,
  mahito: mahitoUltimateHandler,
  // Standalone Additions: Mahoraga (Eight-Handled Sword Divergent Sila Divine General)
  mahoraga: mahoragaUltimateHandler,
  // Batch 13 (10-Character Mega-Batch): Zed, Darius, Mordekaiser, Yone, Gogeta, Vegito, Goku Black, Jogo, Netero, Natsu
  zed: zedUltimateHandler,
  darius: dariusUltimateHandler,
  mordekaiser: mordekaiserUltimateHandler,
  yone: yoneUltimateHandler,
  gogeta: gogetaUltimateHandler,
  vegito: vegitoUltimateHandler,
  gokublack: gokuBlackUltimateHandler,
  jogo: jogoUltimateHandler,
  netero: neteroUltimateHandler,
  natsu: natsuUltimateHandler,
  // Batch 14 (10-Character Mega-Batch): Shinobu, Gyomei, Sanemi, Dabi, Endeavor, Garen, Aatrox, Viego, Makima, Roy Mustang
  shinobu: shinobuUltimateHandler,
  gyomei: gyomeiUltimateHandler,
  sanemi: sanemiUltimateHandler,
  dabi: dabiUltimateHandler,
  endeavor: endeavorUltimateHandler,
  garen: garenUltimateHandler,
  aatrox: aatroxUltimateHandler,
  viego: viegoUltimateHandler,
  makima: makimaUltimateHandler,
  roy: royUltimateHandler,
  // Batch 15 (Fairy Tail Complete 14-Character Pack — 15/15 Fairy Tail 100% Complete!)
  gray: grayUltimateHandler,
  erza: erzaUltimateHandler,
  lucy_ft: lucyFtUltimateHandler,
  laxus: laxusUltimateHandler,
  gajeel: gajeelUltimateHandler,
  wendy: wendyUltimateHandler,
  jellal: jellalUltimateHandler,
  mirajane: mirajaneUltimateHandler,
  gildarts: gildartsUltimateHandler,
  zeref: zerefUltimateHandler,
  acnologia: acnologiaUltimateHandler,
  juvia: juviaUltimateHandler,
  sting: stingUltimateHandler,
  rogue_ft: rogueFtUltimateHandler,
  // Batch 16 (Minecraft Complete 12-Character Pack — 18/18 Minecraft 100% Complete!)
  alex: alexUltimateHandler,
  enderman: endermanUltimateHandler,
  blaze: blazeUltimateHandler,
  irongolem: ironGolemUltimateHandler,
  skeleton: skeletonUltimateHandler,
  zombie: zombieUltimateHandler,
  piglin: piglinUltimateHandler,
  ghast: ghastUltimateHandler,
  shulker: shulkerUltimateHandler,
  technoblade: technobladeUltimateHandler,
  evoker: evokerUltimateHandler,
  ravager: ravagerUltimateHandler,
  // Batch 17 (One Punch Man Complete 14-Character Pack — 15/15 OPM 100% Complete!)
  genos: genosUltimateHandler,
  garou: garouUltimateHandler,
  tatsumaki: tatsumakiUltimateHandler,
  boros: borosUltimateHandler,
  bang: bangUltimateHandler,
  flashyflash: flashyflashUltimateHandler,
  atomic: atomicUltimateHandler,
  king_opm: kingOpmUltimateHandler,
  sonic_opm: sonicOpmUltimateHandler,
  fubuki: fubukiUltimateHandler,
  metalbat: metalbatUltimateHandler,
  zombieman: zombiemanUltimateHandler,
  watchdog: watchdogUltimateHandler,
  orochi_opm: orochiOpmUltimateHandler,
  // Batch 18 (Solo Leveling Complete 13-Character Pack — 14/14 Solo Leveling 100% Complete!)
  igris: igrisUltimateHandler,
  beru: beruUltimateHandler,
  bellion: bellionUltimateHandler,
  tusk_sl: tuskSlUltimateHandler,
  iron_sl: ironSlUltimateHandler,
  cha_haein: chaHaeInUltimateHandler,
  thomas_andre: thomasAndreUltimateHandler,
  liu_zhigang: liuZhigangUltimateHandler,
  go_gunhee: goGunheeUltimateHandler,
  baek_yunho: baekYunhoUltimateHandler,
  choi_jongin: choiJongInUltimateHandler,
  antares: antaresUltimateHandler,
  ashborn: ashbornUltimateHandler,
  // Batch 19 (Attack on Titan Complete 12-Character Pack — 14/14 AoT 100% Complete!)
  mikasa: mikasaUltimateHandler,
  armin: arminUltimateHandler,
  reiner: reinerUltimateHandler,
  annie: annieUltimateHandler,
  zeke: zekeUltimateHandler,
  erwin: erwinUltimateHandler,
  hange: hangeUltimateHandler,
  jean: jeanUltimateHandler,
  sasha: sashaUltimateHandler,
  connie: connieUltimateHandler,
  porco: porcoUltimateHandler,
  lara: laraUltimateHandler,
  // Batch 20 (Game Legends 7-Series Sweep — Undertale, Genshin, MK, Mario, Zelda, Kirby, FF7 100%!)
  papyrus: papyrusUltimateHandler,
  undyne: undyneUltimateHandler,
  chara: charaUltimateHandler,
  jevil: jevilUltimateHandler,
  raiden: raidenUltimateHandler,
  zhongli: zhongliUltimateHandler,
  hutao: hutaoUltimateHandler,
  scorpion: scorpionUltimateHandler,
  subzero: subzeroUltimateHandler,
  mario: marioUltimateHandler,
  link: linkUltimateHandler,
  kirby: kirbyUltimateHandler,
  cloud: cloudUltimateHandler,
  // Batch 21 (League of Legends Complete 13-Champion Pack — 23/23 LoL 100%, ALL Game Series 100%!)
  lux: luxUltimateHandler,
  ezreal: ezrealUltimateHandler,
  akali: akaliUltimateHandler,
  leesin: leeSinUltimateHandler,
  teemo: teemoUltimateHandler,
  thresh: threshUltimateHandler,
  ekko: ekkoUltimateHandler,
  katarina: katarinaUltimateHandler,
  riven: rivenUltimateHandler,
  sett: settUltimateHandler,
  sylas: sylasUltimateHandler,
  kayn: kaynUltimateHandler,
  volibear: volibearUltimateHandler,
  // Batch 22 (Triple 100% Sweep: Jujutsu Kaisen 17/17 + One Piece 20/20 + Demon Slayer 16/16!)
  choso: chosoUltimateHandler,
  boa: boaUltimateHandler,
  sabo: saboUltimateHandler,
  bigmom: bigmomUltimateHandler,
  yamato_op: yamatoOpUltimateHandler,
  marco: marcoUltimateHandler,
  nezuko: nezukoUltimateHandler,
  inosuke: inosukeUltimateHandler,
  mitsuri: mitsuriUltimateHandler,
  muichiro: muichiroUltimateHandler,
  doma: domaUltimateHandler,
  // Batch 23 (Double 100% Sweep: Dragon Ball 18/18 + The Seven Deadly Sins 9/9!)
  buu: buuUltimateHandler,
  trunks: trunksUltimateHandler,
  piccolo: piccoloUltimateHandler,
  hit: hitUltimateHandler,
  bardock: bardockUltimateHandler,
  android17: android17UltimateHandler,
  android18: android18UltimateHandler,
  king_sds: kingSdsUltimateHandler,
  diane: dianeUltimateHandler,
  merlin_sds: merlinSdsUltimateHandler,
  gowther: gowtherUltimateHandler,
  estarossa: estarossaUltimateHandler,
  zeldris: zeldrisUltimateHandler,
  // Batch 24 (Big Three Completion: Naruto 18/18 + Bleach 16/16 100% Complete!)
  tobirama: tobiramaUltimateHandler,
  tsunade: tsunadeUltimateHandler,
  orochimaru: orochimaruUltimateHandler,
  deidara: deidaraUltimateHandler,
  kisame: kisameUltimateHandler,
  killerbee: killerbeeUltimateHandler,
  renji: renjiUltimateHandler,
  grimmjow: grimmjowUltimateHandler,
  starrk: starrkUltimateHandler,
  yoruichi: yoruichiUltimateHandler,
  shunsui: shunsuiUltimateHandler,
  mayuri: mayuriUltimateHandler,
  // Batch 25 (Hunter x Hunter Complete 10-Character Pack — 15/15 HxH 100% Complete!)
  kurapika: kurapikaUltimateHandler,
  leorio: leorioUltimateHandler,
  chrollo: chrolloUltimateHandler,
  feitan: feitanUltimateHandler,
  illumi: illumiUltimateHandler,
  pitou: pitouUltimateHandler,
  youpi: youpiUltimateHandler,
  pouf: poufUltimateHandler,
  kite: kiteUltimateHandler,
  bisky: biskyUltimateHandler,
  // Batch 26 (Chainsaw Man Complete 12-Character Pack — 14/14 CSM 100% Complete!)
  power: powerUltimateHandler,
  aki: akiUltimateHandler,
  reze: rezeUltimateHandler,
  quanxi: quanxiUltimateHandler,
  kishibe: kishibeUltimateHandler,
  kobeni: kobeniUltimateHandler,
  angel_csm: angelCsmUltimateHandler,
  beam_csm: beamCsmUltimateHandler,
  katana_man: katanaManUltimateHandler,
  santa_csm: santaCsmUltimateHandler,
  yoru: yoruUltimateHandler,
  darkness_devil: darknessDevilUltimateHandler,
  // Batch 27 (Fullmetal Alchemist Complete 14-Character Pack — 15/15 FMA 100% Complete!)
  edward: edwardUltimateHandler,
  alphonse: alphonseUltimateHandler,
  scar_fma: scarFmaUltimateHandler,
  kingbradley: kingBradleyUltimateHandler,
  greedling: greedlingUltimateHandler,
  envy_fma: envyFmaUltimateHandler,
  lust_fma: lustFmaUltimateHandler,
  gluttony_fma: gluttonyFmaUltimateHandler,
  pride_fma: prideFmaUltimateHandler,
  sloth_fma: slothFmaUltimateHandler,
  father_fma: fatherFmaUltimateHandler,
  armstrong: armstrongUltimateHandler,
  olivier: olivierUltimateHandler,
  hohenheim: hohenheimUltimateHandler,
  // Batch 28 (My Hero Academia Complete 8-Character Pack — 15/15 MHA 100% Complete & 300 Bespoke Ultimates!)
  allforone: allForOneUltimateHandler,
  toga: togaUltimateHandler,
  hawks: hawksUltimateHandler,
  mirio: mirioUltimateHandler,
  uraraka: urarakaUltimateHandler,
  iida: iidaUltimateHandler,
  kirishima: kirishimaUltimateHandler,
  tokoyami: tokoyamiUltimateHandler,
  // Batch 29 (JoJo's Bizarre Adventure Complete 12-Character Pack — 15/15 JoJo 100% Complete!)
  josuke: josukeUltimateHandler,
  joseph: josephUltimateHandler,
  jonathan: jonathanUltimateHandler,
  jolyne: jolyneUltimateHandler,
  kira: kiraUltimateHandler,
  diavolo: diavoloUltimateHandler,
  pucci: pucciUltimateHandler,
  kars: karsUltimateHandler,
  polnareff: polnareffUltimateHandler,
  kakyoin: kakyoinUltimateHandler,
  bruno: brunoUltimateHandler,
  rohan: rohanUltimateHandler,
  // Batch 30 (Black Clover Complete 13-Character Pack — 14/14 Black Clover 100% Complete!)
  yuno: yunoUltimateHandler,
  yami: yamiUltimateHandler,
  noelle: noelleUltimateHandler,
  julius: juliusUltimateHandler,
  mereoleona: mereoleonaUltimateHandler,
  luck: luckUltimateHandler,
  magna: magnaUltimateHandler,
  nacht: nachtUltimateHandler,
  licht: lichtUltimateHandler,
  zenon: zenonUltimateHandler,
  dante_bc: danteBcUltimateHandler,
  vanica: vanicaUltimateHandler,
  lucius: luciusUltimateHandler,
  // Batch 31 (Fate Complete 12-Character Finale — 15/15 Fate & 337/337 100% ROSTER COMPLETE!!)
  shirou: shirouUltimateHandler,
  rin_tohsaka: rinTohsakaUltimateHandler,
  lancer_cu: lancerCuUltimateHandler,
  rider_medusa: riderMedusaUltimateHandler,
  berserker_herc: berserkerHercUltimateHandler,
  karna: karnaUltimateHandler,
  arjuna: arjunaUltimateHandler,
  iskandar: iskandarUltimateHandler,
  scathach: scathachUltimateHandler,
  jeanne: jeanneUltimateHandler,
  jalter: jalterUltimateHandler,
  enkidu: enkiduUltimateHandler,
  // Batch 32 (Meme Viral Pack — 4/4 Meme Legends & 341/341 100% Roster Complete!)
  stonks_man: stonksManUltimateHandler,
  pop_cat: popCatUltimateHandler,
  ricardo_milos: ricardoMilosUltimateHandler,
  bing_chilling: bingChillingUltimateHandler,
};

export function hasCustomUltimate(characterId: string): boolean {
  return Boolean(ULTIMATE_HANDLERS[characterId]);
}

/**
 * Triggers a character's bespoke modular Ultimate if registered.
 * Returns `true` if handled (bypassing legacy shared templates).
 */
export function triggerCustomUltimate(ctx: AbilityContext, owner: FighterState): boolean {
  const handler = ULTIMATE_HANDLERS[owner.character.id];
  if (!handler) return false;

  // Replace any older active ultimate owned by the same fighter; cap total concurrent custom ultimates safely
  for (let i = ctx.activeUltimates.length - 1; i >= 0; i--) {
    if (ctx.activeUltimates[i].ownerUid === owner.uid) {
      const old = ctx.activeUltimates[i];
      ULTIMATE_HANDLERS[old.characterId]?.onExpire?.(ctx, owner, old);
      ctx.activeUltimates.splice(i, 1);
    }
  }

  const state: ActiveUltimateState = {
    id: ctx.nextId('ult'),
    characterId: owner.character.id,
    ownerUid: owner.uid,
    teamId: owner.teamId,
    title: handler.title,
    subtitle: handler.subtitle,
    bannerColor: handler.bannerColor,
    phase: 'cast',
    elapsed: 0,
    castDuration: handler.castDuration,
    duration: handler.duration,
    data: {},
  };

  owner.transformAngryTimer = Math.max(owner.transformAngryTimer, 3.0);
  handler.onCast(ctx, owner, state);
  ctx.activeUltimates.push(state);
  return true;
}

export function updateCustomUltimates(ctx: AbilityContext, dt: number): void {
  for (let i = ctx.activeUltimates.length - 1; i >= 0; i--) {
    const st = ctx.activeUltimates[i];
    const handler = ULTIMATE_HANDLERS[st.characterId];
    const owner = ctx.fighters.find((f) => f.uid === st.ownerUid) ?? null;

    st.elapsed += dt;
    if (st.elapsed < st.castDuration) {
      st.phase = 'cast';
    } else if (st.elapsed >= st.duration - 0.45) {
      st.phase = 'ending';
    } else {
      st.phase = 'active';
    }

    if (!handler || !owner || !owner.alive || st.elapsed >= st.duration) {
      handler?.onExpire?.(ctx, owner, st);
      ctx.activeUltimates.splice(i, 1);
      continue;
    }

    handler.onTick(ctx, owner, st, dt);
  }
}

/**
 * Resolves physical ball-vs-obstacle bounce collisions & projectile blocking for ArenaObstacles!
 * Guaranteed safe against wall pinching (always keeps fighters strictly inside arena bounds).
 */
export function resolveObstacleCollisions(ctx: AbilityContext, dt: number): void {
  const { left, right, top, bottom } = ctx.bounds;

  for (let i = ctx.obstacles.length - 1; i >= 0; i--) {
    const obs = ctx.obstacles[i];
    if (obs.kind === 'iron-ore' || obs.kind === 'diamond-ore' || obs.kind === 'ancient-debris') {
      continue;
    }
    obs.life -= dt;
    if (obs.life <= 0 || obs.hp <= 0) {
      ctx.spawnParticles(obs.x, obs.y, 12, obs.secondaryColor || obs.color, 60, 200, 3, 6, 'pixel');
      ctx.obstacles.splice(i, 1);
      continue;
    }

    const halfW = obs.w * 0.5;
    const halfH = obs.h * 0.5;

    // 1. Ball vs Obstacle AABB elastic bounce!
    for (const f of ctx.fighters) {
      if (!f.alive) continue;
      // Owner passes gently around their own protective blocks if overlapping on spawn, while enemies bounce hard!
      const isFriendly = f.uid === obs.ownerUid || (obs.teamId !== null && f.teamId === obs.teamId);

      const closestX = Math.max(obs.x - halfW, Math.min(obs.x + halfW, f.x));
      const closestY = Math.max(obs.y - halfH, Math.min(obs.y + halfH, f.y));
      const dx = f.x - closestX;
      const dy = f.y - closestY;
      const dist = Math.hypot(dx, dy);

      if (dist < f.radius) {
        let nx = 0;
        let ny = 0;
        let overlap = f.radius - dist;
        if (dist > 0.001) {
          nx = dx / dist;
          ny = dy / dist;
        } else {
          // Inside box center -> push along shortest exit axis
          const ox = halfW - Math.abs(f.x - obs.x);
          const oy = halfH - Math.abs(f.y - obs.y);
          if (ox < oy) {
            nx = f.x < obs.x ? -1 : 1;
            overlap = ox + f.radius;
          } else {
            ny = f.y < obs.y ? -1 : 1;
            overlap = oy + f.radius;
          }
        }

        // Push fighter out AND clamp strictly inside arena walls so a block can NEVER push a ball out of bounds!
        f.x = Math.max(left + f.radius, Math.min(right - f.radius, f.x + nx * overlap));
        f.y = Math.max(top + f.radius, Math.min(bottom - f.radius, f.y + ny * overlap));

        const vn = f.vx * nx + f.vy * ny;
        if (vn < 0) {
          const bounce = isFriendly ? 1.0 : obs.restitution;
          f.vx -= (1 + bounce) * vn * nx;
          f.vy -= (1 + bounce) * vn * ny;
          if (!isFriendly) {
            obs.hp -= 1;
            ctx.spawnParticles(
              closestX,
              closestY,
              6,
              obs.secondaryColor || '#a855f7',
              50,
              160,
              2.5,
              5,
              'pixel',
            );
            ctx.emitSfx({ type: 'wall', intensity: 1.0 });
          }
        }
      }
    }

    // 2. Block enemy projectiles (Sonic Boom intentionally pierces obstacles!)
    if (obs.blocksProjectiles) {
      for (let pIdx = ctx.projectiles.length - 1; pIdx >= 0; pIdx--) {
        const p = ctx.projectiles[pIdx];
        if (p.kind === 'sonic-boom') continue; // Warden Sonic Boom pierces blocks!
        if (p.ownerUid === obs.ownerUid) continue;
        if (obs.teamId !== null && p.teamId === obs.teamId) continue;

        const closestX = Math.max(obs.x - halfW, Math.min(obs.x + halfW, p.x));
        const closestY = Math.max(obs.y - halfH, Math.min(obs.y + halfH, p.y));
        if (Math.hypot(p.x - closestX, p.y - closestY) <= p.radius) {
          ctx.spawnParticles(
            p.x,
            p.y,
            8,
            obs.secondaryColor || '#a855f7',
            50,
            180,
            2.5,
            5,
            'pixel',
          );
          ctx.projectiles.splice(pIdx, 1);
          obs.hp -= 0.5;
        }
      }
    }
  }
}

/**
 * Asta Anti-Magic Domain Breaker: shatters all enemy Domains, Active Ultimates, Obstacles, Bombs, Projectiles, Beams, Trails, and Shields!
 */
export function shatterEnemyUltimates(ctx: AbilityContext, owner: FighterState): number {
  let broken = 0;
  const isEnemy = (uid: string, teamId: number | null): boolean =>
    uid !== owner.uid && (owner.teamId === null || teamId !== owner.teamId);

  for (let i = ctx.domains.length - 1; i >= 0; i--) {
    const dom = ctx.domains[i];
    if (isEnemy(dom.ownerUid, dom.teamId)) {
      ctx.spawnParticles(dom.x, dom.y, 18, '#ef4444', 90, 290, 3, 6.5, 'shard');
      ctx.domains.splice(i, 1);
      broken += 1;
    }
  }

  for (let i = ctx.activeUltimates.length - 1; i >= 0; i--) {
    const st = ctx.activeUltimates[i];
    if (st.characterId === 'asta' && st.ownerUid === owner.uid) continue;
    if (isEnemy(st.ownerUid, st.teamId)) {
      const targetOwner = ctx.fighters.find((f) => f.uid === st.ownerUid) ?? null;
      ULTIMATE_HANDLERS[st.characterId]?.onExpire?.(ctx, targetOwner, st);
      ctx.activeUltimates.splice(i, 1);
      broken += 1;
    }
  }

  for (let i = ctx.obstacles.length - 1; i >= 0; i--) {
    const obs = ctx.obstacles[i];
    if (isEnemy(obs.ownerUid, obs.teamId)) {
      ctx.spawnParticles(obs.x, obs.y, 10, '#ef4444', 70, 210, 2.5, 5, 'shard');
      ctx.obstacles.splice(i, 1);
      broken += 1;
    }
  }

  for (let i = ctx.bombs.length - 1; i >= 0; i--) {
    if (isEnemy(ctx.bombs[i].ownerUid, ctx.bombs[i].teamId)) {
      ctx.bombs.splice(i, 1);
      broken += 1;
    }
  }

  for (let i = ctx.beams.length - 1; i >= 0; i--) {
    if (isEnemy(ctx.beams[i].ownerUid, ctx.beams[i].teamId)) {
      ctx.beams.splice(i, 1);
      broken += 1;
    }
  }

  for (let i = ctx.trails.length - 1; i >= 0; i--) {
    if (isEnemy(ctx.trails[i].ownerUid, ctx.trails[i].teamId)) {
      ctx.trails.splice(i, 1);
      broken += 1;
    }
  }

  for (let i = ctx.projectiles.length - 1; i >= 0; i--) {
    const p = ctx.projectiles[i];
    if (isEnemy(p.ownerUid, p.teamId)) {
      ctx.spawnParticles(p.x, p.y, 5, '#dc2626', 50, 150, 2, 4, 'shard');
      ctx.projectiles.splice(i, 1);
      broken += 1;
    }
  }

  for (const e of ctx.getEnemies(owner)) {
    if (e.shieldTimer > 0) {
      e.shieldTimer = 0;
      broken += 1;
    }
    if (e.enchantArmorTimer > 0) {
      e.enchantArmorTimer = 0;
      broken += 1;
    }
    if (e.immortalTimer > 0) {
      e.immortalTimer = 0;
      broken += 1;
    }
  }

  return broken;
}
