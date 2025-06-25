# Monad-BOT
menjalankan Monad-BOT

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

## Konfigurasi Private Key

### Metode Aman via Terminal (Rekomendasi)

Masukkan private key langsung (tidak tampil di layar):

```bash
read -s -p "Enter your private key: " key && echo "[\"$key\"]" > privateKeys.json
```

#### Contoh format file `privateKeys.json`:

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

## Menjalankan Bot

```bash
node main.js
```

### Fitur Saat Berjalan:
- apriori
- izumi
- rubic
- magma

---
