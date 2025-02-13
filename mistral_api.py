import os
import json
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
    Analyze the following resume and job description. Extract and return:
    1. A match percentage (0-100)
    2. List of matched skills found in both the resume and job description
    3. List of missing skills that appear in the job description but not in the resume

    Resume:
    {resume_content}

    Job Description:
    {job_description}

    Format the response as valid JSON with this exact structure:
    {{
        "match_percentage": <number>,
        "matched_skills": ["skill1", "skill2", ...],
        "missing_skills": ["skill1", "skill2", ...]
    }}
    """

    response = requests.post(
        MISTRAL_API_URL,
        headers=headers,
        json={
            "model": "mistral-medium",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.7,
            "response_format": { "type": "json_object" }
        }
    )

    if response.status_code != 200:
        raise Exception(f"Failed to analyze with Mistral API: {response.text}")

    try:
        result = response.json()
        content = result["choices"][0]["message"]["content"]
        # Parse the JSON string in the content
        analysis = json.loads(content)
        return analysis
    except (KeyError, json.JSONDecodeError) as e:
        raise Exception(f"Failed to parse Mistral API response: {str(e)}")

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
    5. Return only the enhanced LaTeX content
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
        raise Exception(f"Failed to enhance resume with Mistral API: {response.text}")

    try:
        result = response.json()
        enhanced_content = result["choices"][0]["message"]["content"]
        return enhanced_content
    except KeyError as e:
        raise Exception(f"Failed to parse Mistral API response: {str(e)}")