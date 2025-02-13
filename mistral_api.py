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
    Analyze the following resume and job description comprehensively. Return:
    1. A match percentage (0-100)
    2. Technical skills found in both (programming languages, tools, frameworks)
    3. Soft skills and qualifications found in both (leadership, communication)
    4. Missing technical skills from job description
    5. Missing qualifications and requirements from job description

    Resume:
    {resume_content}

    Job Description:
    {job_description}

    Format the response as valid JSON with this exact structure:
    {{
        "match_percentage": <number>,
        "matched_technical_skills": ["skill1", "skill2", ...],
        "matched_qualifications": ["qual1", "qual2", ...],
        "missing_technical_skills": ["skill1", "skill2", ...],
        "missing_qualifications": ["qual1", "qual2", ...]
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
        analysis = json.loads(content)

        # Combine matched skills for backward compatibility
        analysis["matched_skills"] = analysis["matched_technical_skills"] + analysis["matched_qualifications"]
        analysis["missing_skills"] = analysis["missing_technical_skills"] + analysis["missing_qualifications"]

        return analysis
    except (KeyError, json.JSONDecodeError) as e:
        raise Exception(f"Failed to parse Mistral API response: {str(e)}")

def enhance_resume(resume_content: str, skills: List[str]) -> Dict[str, str]:
    headers = {
        "Authorization": f"Bearer {MISTRAL_API_KEY}",
        "Content-Type": "application/json"
    }

    prompt = f"""
    Enhance the following LaTeX resume by incorporating these skills/qualifications:
    {', '.join(skills)}

    Original Resume:
    {resume_content}

    Rules:
    1. Maintain LaTeX formatting and structure
    2. Add skills naturally to relevant sections
    3. Don't remove existing content
    4. Keep the enhancement subtle and professional
    5. Return the response in this JSON format:
    {{
        "enhanced_content": "The complete enhanced LaTeX content",
        "changes_made": ["List of specific changes made"],
        "html_preview": "The resume content converted to clean HTML for preview"
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
        raise Exception(f"Failed to enhance resume with Mistral API: {response.text}")

    try:
        result = response.json()
        content = result["choices"][0]["message"]["content"]
        return json.loads(content)
    except (KeyError, json.JSONDecodeError) as e:
        raise Exception(f"Failed to parse Mistral API response: {str(e)}")