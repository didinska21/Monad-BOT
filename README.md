# ðŸ§  Monad-BOT

**Monad-BOT** adalah bot terminal bergaya cyberpunk futuristik yang berjalan di jaringan **Monad Testnet**. Bot ini menampilkan animasi loading interaktif, ASCII banner keren, progress bar, dan dukungan multi-wallet melalui private key.

---

## ðŸš€ Cara Install & Menjalankan Monad-BOT

### 1. Clone Repository

```bash
git clone https://github.com/didinska21/Monad-BOT.git
```

### 2. Masuk ke Direktori Proyek

```bash
cd Monad-BOT
```

### 3. Install Dependencies

```bash
npm install
```

---

## ðŸ” Konfigurasi Private Key

### Metode Aman via Terminal (Rekomendasi)

Masukkan private key langsung (tidak tampil di layar):

```bash
read -s -p "Enter your private key: " key && echo "[\"$key\"]" > privateKeys.json
```

#### ðŸ’¡ Contoh format file `privateKeys.json`:

```json
["0xabc1234yourprivatekey"]
```

### Ingin Tambah Lebih dari Satu Private Key?

```bash
read -s -p "Enter your private key 1: " key1 && \
read -s -p $'\nEnter your private key 2: ' key2 && \
echo "[\"$key1\", \"$key2\"]" > privateKeys.json
```

---

## â–¶ï¸ Menjalankan Bot

```bash
node main.js
```

### Fitur Saat Berjalan:
- ASCII title gaya cyberpunk
- Spinner animasi `| / - \`
- Progress bar realtime
- Timestamp di setiap langkah
- Simulasi error + auto-retry
- Efek glitch karakter
- Bell ðŸ”” terminal saat ready

---

## âš ï¸ Keamanan

- **JANGAN** commit `privateKeys.json` ke repository publik.
- Tambahkan ke `.gitignore`:

```bash
echo "privateKeys.json" >> .gitignore
```
