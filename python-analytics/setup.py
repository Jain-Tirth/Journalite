#!/usr/bin/env python3
"""
Setup script for Journalite Python Analytics Backend
"""

import os
import sys
import subprocess
import platform

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"\n🔧 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed: {e}")
        print(f"Error output: {e.stderr}")
        return False

def check_python_version():
    """Check if Python version is compatible"""
    print("🐍 Checking Python version...")
    version = sys.version_info
    if version.major == 3 and version.minor >= 8:
        print(f"✅ Python {version.major}.{version.minor}.{version.micro} is compatible")
        return True
    else:
        print(f"❌ Python {version.major}.{version.minor}.{version.micro} is not compatible. Please use Python 3.8+")
        return False

def create_virtual_environment():
    """Create virtual environment"""
    if os.path.exists('venv'):
        print("📁 Virtual environment already exists")
        return True
    
    return run_command("python -m venv venv", "Creating virtual environment")

def activate_virtual_environment():
    """Get activation command for virtual environment"""
    if platform.system() == "Windows":
        return "venv\\Scripts\\activate"
    else:
        return "source venv/bin/activate"

def install_requirements():
    """Install Python requirements"""
    pip_command = "venv\\Scripts\\pip" if platform.system() == "Windows" else "venv/bin/pip"
    return run_command(f"{pip_command} install -r requirements.txt", "Installing Python packages")

def download_nltk_data():
    """Download required NLTK data"""
    python_command = "venv\\Scripts\\python" if platform.system() == "Windows" else "venv/bin/python"
    nltk_script = """
import nltk
nltk.download('punkt')
nltk.download('stopwords')
nltk.download('vader_lexicon')
nltk.download('wordnet')
print('NLTK data downloaded successfully')
"""
    
    with open('download_nltk.py', 'w') as f:
        f.write(nltk_script)
    
    result = run_command(f"{python_command} download_nltk.py", "Downloading NLTK data")
    
    # Clean up
    if os.path.exists('download_nltk.py'):
        os.remove('download_nltk.py')
    
    return result

def download_spacy_model():
    """Download spaCy English model"""
    python_command = "venv\\Scripts\\python" if platform.system() == "Windows" else "venv/bin/python"
    return run_command(f"{python_command} -m spacy download en_core_web_sm", "Downloading spaCy English model")

def create_directories():
    """Create necessary directories"""
    directories = ['models', 'logs', 'cache']
    
    for directory in directories:
        if not os.path.exists(directory):
            os.makedirs(directory)
            print(f"📁 Created directory: {directory}")
    
    return True

def setup_environment_file():
    """Setup environment file"""
    if not os.path.exists('.env'):
        if os.path.exists('.env.example'):
            run_command("cp .env.example .env" if platform.system() != "Windows" else "copy .env.example .env", 
                       "Creating .env file from example")
            print("\n⚠️  Please edit .env file with your actual API keys and configuration")
        else:
            print("❌ .env.example file not found")
            return False
    else:
        print("📄 .env file already exists")
    
    return True

def test_installation():
    """Test the installation"""
    python_command = "venv\\Scripts\\python" if platform.system() == "Windows" else "venv/bin/python"
    test_script = """
try:
    import flask
    import pandas
    import numpy
    import textblob
    import transformers
    import google.generativeai
    print('✅ All required packages imported successfully')
    
    # Test basic functionality
    from textblob import TextBlob
    blob = TextBlob('I am happy today')
    print(f'✅ TextBlob sentiment test: {blob.sentiment.polarity}')
    
    print('🎉 Installation test completed successfully!')
    
except ImportError as e:
    print(f'❌ Import error: {e}')
    exit(1)
except Exception as e:
    print(f'❌ Test error: {e}')
    exit(1)
"""
    
    with open('test_installation.py', 'w') as f:
        f.write(test_script)
    
    result = run_command(f"{python_command} test_installation.py", "Testing installation")
    
    # Clean up
    if os.path.exists('test_installation.py'):
        os.remove('test_installation.py')
    
    return result

def main():
    """Main setup function"""
    print("🚀 Setting up Journalite Python Analytics Backend")
    print("=" * 50)
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
    
    # Create virtual environment
    if not create_virtual_environment():
        sys.exit(1)
    
    # Install requirements
    if not install_requirements():
        sys.exit(1)
    
    # Download NLTK data
    if not download_nltk_data():
        print("⚠️  NLTK data download failed, but continuing...")
    
    # Download spaCy model
    if not download_spacy_model():
        print("⚠️  spaCy model download failed, but continuing...")
    
    # Create directories
    create_directories()
    
    # Setup environment file
    setup_environment_file()
    
    # Test installation
    if not test_installation():
        print("❌ Installation test failed")
        sys.exit(1)
    
    print("\n🎉 Setup completed successfully!")
    print("\n📋 Next steps:")
    print("1. Edit .env file with your API keys")
    print("2. Activate virtual environment:")
    print(f"   {activate_virtual_environment()}")
    print("3. Run the application:")
    print("   python app.py")
    print("\n🔗 The API will be available at: http://localhost:5000")

if __name__ == "__main__":
    main()
