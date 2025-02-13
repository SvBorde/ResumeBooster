import json
from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from models import Resume, JobAnalysis, db
from mistral_api import analyze_job_description, enhance_resume

resume = Blueprint('resume', __name__)

@resume.route('/api/resume/upload', methods=['POST'])
@login_required
def upload_resume():
    data = request.get_json()
    latex_content = data.get('latex_content')

    if not latex_content:
        return jsonify({'error': 'No LaTeX content provided'}), 400

    resume = Resume(user_id=current_user.id, latex_content=latex_content)
    db.session.add(resume)
    db.session.commit()

    return jsonify({'message': 'Resume uploaded successfully', 'id': resume.id}), 201

@resume.route('/api/resume/analyze', methods=['POST'])
@login_required
def analyze_resume():
    data = request.get_json()
    resume_id = data.get('resume_id')
    job_description = data.get('job_description')

    resume = Resume.query.get_or_404(resume_id)

    if resume.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403

    analysis = analyze_job_description(resume.latex_content, job_description)

    job_analysis = JobAnalysis(
        resume_id=resume_id,
        job_description=job_description,
        match_percentage=analysis['match_percentage'],
        matched_skills=json.dumps(analysis['matched_skills']),
        missing_skills=json.dumps(analysis['missing_skills'])
    )

    db.session.add(job_analysis)
    db.session.commit()

    return jsonify(analysis), 200

@resume.route('/api/resume/enhance', methods=['POST'])
@login_required
def enhance_resume_route():
    data = request.get_json()
    resume_id = data.get('resume_id')
    selected_skills = data.get('selected_skills', [])

    resume = Resume.query.get_or_404(resume_id)

    if resume.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403

    enhanced_result = enhance_resume(resume.latex_content, selected_skills)

    # Update the resume with enhanced content
    resume.latex_content = enhanced_result['enhanced_content']
    db.session.commit()

    return jsonify(enhanced_result), 200