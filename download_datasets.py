"""
Dataset Downloader for Misinformation Detection Project
Downloads multiple datasets for deepfake and AI-generated content detection
"""

import os
import subprocess
import sys
from pathlib import Path

def install_requirements():
    """Install required packages"""
    print("📦 Installing required packages...")
    packages = [
        "datasets",
        "huggingface_hub[cli]",
        "git-lfs"
    ]
    
    for package in packages:
        print(f"   Installing {package}...")
        subprocess.run([sys.executable, "-m", "pip", "install", "-U", package], 
                      capture_output=True)
    
    print("✅ Packages installed!\n")

def setup_git_lfs():
    """Install and configure git-lfs"""
    print("🔧 Setting up Git LFS...")
    try:
        # Check if git-lfs is installed
        result = subprocess.run(["git", "lfs", "version"], 
                              capture_output=True, text=True)
        if result.returncode == 0:
            print("   Git LFS already installed!")
        else:
            print("   Installing Git LFS...")
            subprocess.run(["git", "lfs", "install"])
        print("✅ Git LFS ready!\n")
    except Exception as e:
        print(f"⚠️ Warning: Git LFS setup failed: {e}")
        print("   You may need to install it manually from: https://git-lfs.com\n")

def download_dataset_1():
    """Download Dataset 1: AI-Generated vs Real Images"""
    print("=" * 60)
    print("📥 DATASET 1: AI-Generated vs Real Images")
    print("=" * 60)
    print("Source: Hemg/AI-Generated-vs-Real-Images-Datasets")
    print("Loading...\n")
    
    try:
        from datasets import load_dataset
        
        dataset_dir = Path("datasets/ai_generated_real_images")
        dataset_dir.mkdir(parents=True, exist_ok=True)
        
        print("⏳ Downloading... (This may take several minutes)")
        ds = load_dataset("Hemg/AI-Generated-vs-Real-Images-Datasets")
        
        # Save to disk
        print(f"💾 Saving to: {dataset_dir.absolute()}")
        ds.save_to_disk(str(dataset_dir))
        
        print("✅ Dataset 1 downloaded successfully!")
        print(f"   Location: {dataset_dir.absolute()}")
        print(f"   Splits: {list(ds.keys())}\n")
        
        return True
    except Exception as e:
        print(f"❌ Error downloading Dataset 1: {e}\n")
        return False

def download_dataset_2():
    """Download Dataset 2: Deepfake Face Classification"""
    print("=" * 60)
    print("📥 DATASET 2: Deepfake Face Classification")
    print("=" * 60)
    print("Source: pujanpaudel/deepfake_face_classification")
    print("Loading...\n")
    
    dataset_dir = Path("datasets/deepfake_face_classification")
    dataset_dir.mkdir(parents=True, exist_ok=True)
    
    try:
        # Method 1: Using git clone (recommended for large files)
        print("📦 Method: Git Clone with LFS")
        print("⏳ Cloning repository... (This may take a while)")
        
        os.chdir("datasets")
        
        # Clone with git-lfs
        result = subprocess.run([
            "git", "clone",
            "https://huggingface.co/datasets/pujanpaudel/deepfake_face_classification",
            "deepfake_face_classification"
        ], capture_output=True, text=True)
        
        os.chdir("..")
        
        if result.returncode == 0:
            print("✅ Dataset 2 downloaded successfully!")
            print(f"   Location: {dataset_dir.absolute()}\n")
            return True
        else:
            print(f"⚠️ Git clone returned code: {result.returncode}")
            print(f"   Error: {result.stderr}")
            
            # Fallback to huggingface_hub
            print("\n🔄 Trying alternative method: HuggingFace CLI")
            return download_dataset_2_fallback()
            
    except Exception as e:
        print(f"❌ Error with git clone: {e}")
        print("\n🔄 Trying alternative method...")
        return download_dataset_2_fallback()

def download_dataset_2_fallback():
    """Fallback method using huggingface_hub CLI"""
    try:
        from huggingface_hub import snapshot_download
        
        print("⏳ Downloading via HuggingFace Hub...")
        dataset_dir = Path("datasets/deepfake_face_classification")
        
        snapshot_download(
            repo_id="pujanpaudel/deepfake_face_classification",
            repo_type="dataset",
            local_dir=str(dataset_dir),
            local_dir_use_symlinks=False
        )
        
        print("✅ Dataset 2 downloaded successfully!")
        print(f"   Location: {dataset_dir.absolute()}\n")
        return True
    except Exception as e:
        print(f"❌ Fallback method also failed: {e}\n")
        return False

def download_dataset_3():
    """Download Dataset 3: DeepFakeFace"""
    print("=" * 60)
    print("📥 DATASET 3: DeepFakeFace")
    print("=" * 60)
    print("Source: OpenRL/DeepFakeFace")
    print("Loading...\n")
    
    try:
        from datasets import load_dataset
        
        dataset_dir = Path("datasets/deepfake_face_openrl")
        dataset_dir.mkdir(parents=True, exist_ok=True)
        
        print("⏳ Downloading... (This may take several minutes)")
        ds = load_dataset("OpenRL/DeepFakeFace")
        
        # Save to disk
        print(f"💾 Saving to: {dataset_dir.absolute()}")
        ds.save_to_disk(str(dataset_dir))
        
        print("✅ Dataset 3 downloaded successfully!")
        print(f"   Location: {dataset_dir.absolute()}")
        print(f"   Splits: {list(ds.keys())}\n")
        
        return True
    except Exception as e:
        print(f"❌ Error downloading Dataset 3: {e}\n")
        return False

def main():
    """Main download orchestrator"""
    print("\n" + "=" * 60)
    print("🚀 DATASET DOWNLOADER FOR MISINFORMATION DETECTION")
    print("=" * 60)
    print("This will download 3 datasets:")
    print("  1. AI-Generated vs Real Images")
    print("  2. Deepfake Face Classification")
    print("  3. DeepFakeFace (OpenRL)")
    print("=" * 60 + "\n")
    
    # Create datasets directory
    Path("datasets").mkdir(exist_ok=True)
    
    # Step 1: Install requirements
    install_requirements()
    
    # Step 2: Setup git-lfs
    setup_git_lfs()
    
    # Step 3: Download datasets
    results = {}
    
    print("\n🎯 Starting downloads...\n")
    
    results['dataset_1'] = download_dataset_1()
    results['dataset_2'] = download_dataset_2()
    results['dataset_3'] = download_dataset_3()
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 DOWNLOAD SUMMARY")
    print("=" * 60)
    
    success_count = sum(results.values())
    total_count = len(results)
    
    print(f"✅ Successful: {success_count}/{total_count}")
    print(f"❌ Failed: {total_count - success_count}/{total_count}\n")
    
    if results['dataset_1']:
        print("✓ Dataset 1: datasets/ai_generated_real_images/")
    else:
        print("✗ Dataset 1: Failed to download")
    
    if results['dataset_2']:
        print("✓ Dataset 2: datasets/deepfake_face_classification/")
    else:
        print("✗ Dataset 2: Failed to download")
    
    if results['dataset_3']:
        print("✓ Dataset 3: datasets/deepfake_face_openrl/")
    else:
        print("✗ Dataset 3: Failed to download")
    
    print("\n" + "=" * 60)
    
    if success_count == total_count:
        print("🎉 All datasets downloaded successfully!")
    elif success_count > 0:
        print("⚠️ Some datasets failed. Check errors above.")
    else:
        print("❌ All downloads failed. Check your internet connection.")
    
    print("=" * 60 + "\n")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️ Download cancelled by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Unexpected error: {e}")
        sys.exit(1)
