# 📥 Dataset Download Guide

## 🎯 Quick Start

### Option 1: Automatic Download (Recommended)

Run the Python script I created:

```powershell
python download_datasets.py
```

This will automatically:
- ✅ Install required packages
- ✅ Setup Git LFS
- ✅ Download all 3 datasets
- ✅ Save them in organized folders

---

## 📊 Datasets to Download

### 1. **AI-Generated vs Real Images** 
- **Source:** `Hemg/AI-Generated-vs-Real-Images-Datasets`
- **Size:** ~Several GB
- **Purpose:** Train model to detect AI-generated images
- **Location:** `datasets/ai_generated_real_images/`

### 2. **Deepfake Face Classification**
- **Source:** `pujanpaudel/deepfake_face_classification`
- **Size:** Large (includes video files)
- **Purpose:** Detect deepfake faces in news articles
- **Location:** `datasets/deepfake_face_classification/`

### 3. **DeepFakeFace (OpenRL)**
- **Source:** `OpenRL/DeepFakeFace`
- **Size:** ~Several GB
- **Purpose:** Additional deepfake detection training data
- **Location:** `datasets/deepfake_face_openrl/`

---

## 📦 Manual Download (If Script Fails)

### Prerequisites

```powershell
# Install Python packages
pip install datasets huggingface_hub[cli]

# Install Git LFS (download from https://git-lfs.com)
git lfs install
```

### Dataset 1: AI-Generated vs Real Images

```python
from datasets import load_dataset

# Download
ds = load_dataset("Hemg/AI-Generated-vs-Real-Images-Datasets")

# Save to disk
ds.save_to_disk("datasets/ai_generated_real_images")
```

### Dataset 2: Deepfake Face Classification

**Method A: Git Clone (Recommended)**
```powershell
cd datasets
git clone https://huggingface.co/datasets/pujanpaudel/deepfake_face_classification
cd ..
```

**Method B: HuggingFace CLI**
```powershell
hf download pujanpaudel/deepfake_face_classification --repo-type=dataset --local-dir datasets/deepfake_face_classification
```

**Method C: Python**
```python
from huggingface_hub import snapshot_download

snapshot_download(
    repo_id="pujanpaudel/deepfake_face_classification",
    repo_type="dataset",
    local_dir="datasets/deepfake_face_classification"
)
```

### Dataset 3: DeepFakeFace (OpenRL)

```python
from datasets import load_dataset

# Download
ds = load_dataset("OpenRL/DeepFakeFace")

# Save to disk
ds.save_to_disk("datasets/deepfake_face_openrl")
```

---

## 🗂️ Expected Folder Structure

After downloading, you should have:

```
Mumbaihacks/
├── datasets/
│   ├── ai_generated_real_images/
│   │   ├── dataset_dict.json
│   │   ├── train/
│   │   └── test/
│   │
│   ├── deepfake_face_classification/
│   │   ├── README.md
│   │   ├── data/
│   │   └── .git/
│   │
│   └── deepfake_face_openrl/
│       ├── dataset_dict.json
│       ├── train/
│       └── test/
│
├── download_datasets.py
└── DATASET_DOWNLOAD_GUIDE.md
```

---

## ⚡ Troubleshooting

### Issue: "Git LFS not installed"

**Solution:**
1. Download from: https://git-lfs.com
2. Install Git LFS
3. Run: `git lfs install`
4. Retry download

### Issue: "Connection timeout"

**Solution:**
- Check internet connection
- Try downloading one dataset at a time
- Use VPN if HuggingFace is blocked

### Issue: "Out of disk space"

**Solution:**
- These datasets are LARGE (10GB+ each)
- Ensure you have at least 50GB free space
- Download to external drive if needed:
  ```powershell
  # Change download location
  cd D:\datasets  # or your external drive
  python download_datasets.py
  ```

### Issue: "Import error: datasets not found"

**Solution:**
```powershell
pip install --upgrade datasets huggingface_hub
```

---

## 💾 Disk Space Requirements

| Dataset | Approximate Size |
|---------|-----------------|
| Dataset 1 (AI-Generated) | ~5-10 GB |
| Dataset 2 (Deepfake Face) | ~15-20 GB |
| Dataset 3 (DeepFakeFace) | ~5-10 GB |
| **Total** | **~30-40 GB** |

**Recommendation:** Have at least **50GB free space** before starting!

---

## 🔐 Authentication (If Required)

Some datasets may require HuggingFace login:

```powershell
# Login to HuggingFace
huggingface-cli login

# Then run download script
python download_datasets.py
```

---

## ✅ Verify Downloads

After downloading, verify with:

```python
from datasets import load_from_disk
import os

# Check Dataset 1
if os.path.exists("datasets/ai_generated_real_images"):
    ds1 = load_from_disk("datasets/ai_generated_real_images")
    print(f"✓ Dataset 1: {ds1}")

# Check Dataset 2
if os.path.exists("datasets/deepfake_face_classification"):
    print(f"✓ Dataset 2: Found at datasets/deepfake_face_classification")

# Check Dataset 3
if os.path.exists("datasets/deepfake_face_openrl"):
    ds3 = load_from_disk("datasets/deepfake_face_openrl")
    print(f"✓ Dataset 3: {ds3}")
```

---

## 🚀 Next Steps

After downloading:

1. **Explore the data:**
   ```python
   from datasets import load_from_disk
   ds = load_from_disk("datasets/ai_generated_real_images")
   print(ds)
   print(ds['train'][0])  # View first sample
   ```

2. **Train your model** using these datasets

3. **Integrate with your extension** for real-time analysis

---

## 📝 Notes

- Downloads may take **30-60 minutes** depending on internet speed
- Some datasets are **very large** - be patient!
- Git LFS is required for large file support
- Downloads are resumable if interrupted

---

## 🆘 Need Help?

If downloads fail:
1. Check the error messages
2. Ensure you have enough disk space
3. Try downloading one dataset at a time
4. Check firewall/antivirus settings
5. Try manual download methods above

**Good luck with your hackathon! 🎉**
