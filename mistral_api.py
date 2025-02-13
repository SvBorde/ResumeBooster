import os
import requests
from typing import Dict, List

MISTRAL_API_KEY = os.environ.get("MISTRAL_API_KEY")
MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions"

def analyze_job_description(resume_content: str, job_description: str) -> Dict:
    headers = {
        "Authorization": f"Bearer {MISTRAL_API_KEY}",
        "Content-Type": "application/json"
    }
    
    prompt = f"""
    Analyze the following resume and job description. Provide:
    1. A match percentage
    2. List of matched skills
    3. List of missing skills
    
    Resume:
    {resume_content}
    
    Job Description:
    {job_description}
    
    Provide the response in JSON format with keys: match_percentage, matched_skills, missing_skills
    """
    
    response = requests.post(
        MISTRAL_API_URL,
        headers=headers,
        json={
            "model": "mistral-medium",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.7
        }
    )
    
    if response.status_code != 200:
        raise Exception("Failed to analyze with Mistral API")
        
    analysis = response.json()["choices"][0]["message"]["content"]
    return analysis

def enhance_resume(resume_content: str, skills: List[str]) -> str:
    headers = {
        "Authorization": f"Bearer {MISTRAL_API_KEY}",
        "Content-Type": "application/json"
    }
    
    prompt = f"""
    Enhance the following LaTeX resume by naturally incorporating these skills:
    {', '.join(skills)}
    
    Original Resume:
    {resume_content}
    
    Rules:
    1. Maintain LaTeX formatting
    2. Add skills naturally to relevant sections
    3. Don't remove existing content
    4. Keep the enhancement subtle and professional
    """
    
    response = requests.post(
        MISTRAL_API_URL,
        headers=headers,
        json={
            "model": "mistral-medium",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.7
        }
    )
    
    if response.status_code != 200:
        raise Exception("Failed to enhance resume with Mistral API")
        
    enhanced_content = response.json()["choices"][0]["message"]["content"]
    return enhanced_content
