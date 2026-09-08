# project-vocab

Kelime ezberleme uygulaması. Vue 3 (Composition API, `<script setup>`) + Pinia + vue-router
frontend, FastAPI + psycopg2 + PostgreSQL backend. Tek geliştirici, tek repo.

---

# A. Mimari

## Çalıştırma

| ne | komut / dosya |
|---|---|
| frontend (dev) | `npm run dev` → Vite, **port 443**, HTTPS (sertifika `config/vite/OS.ts`) |
| tip kontrolü | `npm run type-check` (`vue-tsc`) |
| lint / format | `npm run lint`, `npm run format` |
| backend | `main/src/backend/__main__.py` → uvicorn, port **5174**, HTTPS |
| bağımlılıklar | `package.json`, `requirements.txt` |

### Sunucuları kullanıcı başlatır

Frontend ve backend'i **Claude başlatmaz** — kullanıcıya hangi komutu yazacağını söyler.
Gerektiğinde aynen bunu ilet (iki ayrı terminal):

**Frontend** (repo kökünden):
```
cd C:\Users\okana\custom\github-projects-already-stored\project-vocab
npm run dev
```
→ `https://localhost` (port 443, adrese port yazmaya gerek yok).

**Backend** (venv + `main\src` klasöründen):
```
cd C:\Users\okana\custom\github-projects-already-stored\project-vocab
.\.venv\Scripts\Activate.ps1
cd main\src
python -m backend
```
→ `https://localhost:5174`. Aktivasyon yerine tek satır da olur:
`..\..\.venv\Scripts\python.exe -m backend` (yine `main\src` içinden).

Tuzaklar:
- **Backend `main\src` dışından başlatılmaz** — `__main__.py` hem `hidden/.env`'i hem
  sertifikaları göreli yoldan okur.
- `Activate.ps1` "betik çalıştırma devre dışı" derse:
  `Set-ExecutionPolicy -Scope Process RemoteSigned`.
- Proxy'de `ECONNREFUSED /initialData` = backend ayakta değil, frontend sorunu değildir.
- Sertifikalar mkcert (localhost / 127.0.0.1 / 192.168.178.26, 2028'e kadar geçerli).
  Tarayıcı uyarıyorsa kök CA kurulu değildir: `winget install FiloSottile.mkcert` +
  `mkcert -install`. Geçici çözümde `https://localhost` **ve** `https://localhost:5174`
  ayrı ayrı kabul edilmeli.

Vite `/api/*` isteklerini `https://<backend-ip>:5174` adresine proxy'ler ve `/api` önekini
**siler** — yani frontend'deki `/api/addPage`, backend'deki `@router.post("/addPage")`'e düşer.
`@` alias'ı `main/src/frontend` demektir.

## Klasör haritası

```
main/src/frontend/
  Pages/<PageX>/            sayfa bileşeni + kendi .scss'i (Dashboard, Words, AddPage,
                            Landing, Loading, Portfolio) — rotalar: router/index.ts
  NonPageComponents/        ButtonX (her yerde kullanılan kart/buton), SvgX, Tooltip,
                            ConfirmationPopup, ContextMenu, LiquidGlass, Sparkles
  wordManagement/           model kurulumu + API istekleri (aşağıda)
  stores/appStore.ts        Pinia: initialData, dashboardModel, loadInitialData, loadPages
  directives/tap.ts         @tap / @tap.long direktifi, eşikler dosyanın başında sabit
  junk/                     yardımcılar + scss değişkenleri (color-palette, variables)
main/src/backend/
  api/*.py                  endpoint başına bir dosya
  jwt_handler.py            verify_app_jwt
  os.py, roles.py, db_util/
pretendServer/project-vocab/   ESKİ AYNA — okunabilir, DÜZENLENMEZ.
```

## Veri modeli — en kritik nokta

`pages` tablosu: `(id, user_id, name, description, words jsonb, time_spent_seconds, last_entry_at)`.

**`words` tek bir düz metindir**, jsonb scalar string olarak saklanır:
satırlar `\n` ile, kelime/anlam ayracı ` | ` (kabul edilen ayraçlar: `"\t"`, dört boşluk, `" | "`).
Kelime bazında satır, id veya istatistik **yoktur**; `marker` gibi alanlar sadece frontend
state'idir, kalıcı değildir.

Ayrıştırma tek noktadan yapılır: `WordManager.instance.setupWords(raw)` →
`main/src/frontend/wordManagement/wordManager.ts:21`. Yeni bir parser yazma, bunu kullan.

Görüntüleme modları `wordManagement/WordMode.ts` içindeki `WordMode` enum'u
(`SHORT / LONG / MEANING`).

## Backend kalıbı (bağlayıcı)

Her `api/*.py` dosyası **kendi kopyasını** taşır: `POSTGRES_*` env okuması,
`get_db_connection()`, `auth_required()` (cookie'deki `access_token` → `verify_app_jwt`).
Bu kasıtlı bir tekrardır; ortak modüle çıkarma. Yeni endpoint:

1. `api/<method>_<isim>.py` dosyası, aynı kalıp.
2. `words` yazarken `json.dumps(...)` ile jsonb'ye ver (`post_addNewPageRequest.py:52`).
3. Sahiplik her zaman sorgunun `WHERE ... AND user_id = %s` kısmında; `fetchone()` boşsa `404`.
4. `__main__.py`'de import (`:6-11`) + `include_router` (`:34-39`).

Frontend tarafı: `wordManagement/<isim>Request.ts`, `addNewPageRequest.ts` kalıbı — `fetch`,
`Promise<PostRequestResponse>`, hata fırlatmaz, `{ success: false, error }` döndürür.

---

# B. Kurallar

## Çalışma disiplini

1. **Authority sırası**: kullanıcı talimatı > onaylı kurallar > bu dosya > koddaki mevcut
   pattern > genel konvansiyon.
2. **En yakın mevcudu kullan**, paralel pattern uydurma. En küçük değişikliği yap; istenmeyen
   refactor yok.
3. **Belirsizlikte dur, sor.** Yeni mimari karar gerekiyorsa somut seçenek + artı/eksi sun ve
   açık onay bekle. Sessizlik veya üretilen kodun kabulü onay sayılmaz.
4. **Statik dosya haritası tutma** — bayatlar. Yukarıdaki harita yön içindir; kesin bilgi için
   Grep/Glob ile keşfet.
5. **Kural durumu etiketi**: sadece *Confirmed* bağlayıcıdır; *Observed / Legacy / Pending*
   yalnızca nottur.
6. **Değişiklik sonrası diff'i bu kurallara karşı kontrol et.**
7. **Uzun iş akışı dokümanları @import edilmez** — sadece o iş yapılırken okunur.

## Soru disiplini

8. **K1 / K2 / K3**
   - K1 (cevabı koddan veya kuraldan belli) → sorma; karar ver ve "Varsayımlar"a yaz.
   - K2 (mimari trade-off) → sor; cevap gelmezse kendi önerinle devam et ve Varsayımlar'a yaz.
   - K3 (kullanıcının tasarım/ürün niyeti, koddan türetilemez) → **asla tahmin etme, sor.**
9. **Soru bütçesi**: bir işte en fazla 4 soru. Az sormak makbuldür; bütçeyi doldurmak hedef değil.
10. **Sormadan önce dedup**: soru bu dosyada veya mem0'da
    (`python ~/.claude/mem0/hooks/recall.py "<anahtar kelimeler>"`, salt okunur) cevaplanmışsa
    K1'e düşer ve sorulmaz.

## Ajan / doğrulama

11. **Subagent context yalıtımı**: subagent raporlarının içeriği ana oturuma çekilmez — subagent
    karar + en fazla 3 satır not + dosya yolu döndürür. Maliyet çağrı başına sabit değil,
    kümülatiftir.
12. **Ölçülmeyen doğrulanmamıştır**: koda bakıp "doğru görünüyor" demek doğrulama değildir.
    Çalıştırılmadıysa öyle söylenir.
13. **2 tur limiti**: aynı sorunu düzeltmek için en fazla 2 tur; üçüncüde dur ve kullanıcıya sor.

## Projeye özel

14. **Merkezi tip/sabit dosyası**: enum ve eşik sabitleri (`WordMode`, `DOUBLE_CLICK_MS`, tap
    eşikleri) dağınık değil tek yerde tutulur.
15. **Backend endpoint kalıbı bağlayıcı** (yukarıdaki 4 adım) — paralel bir yapı kurulmaz.
    Frontend'de doğrudan alıcısı belli iletişim prop/emit ile gider; store'a global state
    eklenmez.
