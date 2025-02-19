import json
from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from werkzeug.utils import secure_filename
from models import Resume, JobAnalysis, db
from mistral_api import analyze_job_description, enhance_resume
import re

resume = Blueprint('resume', __name__, url_prefix='/api')

def validate_html_content(content):
    """Validate HTML content for security."""
    # Basic XSS protection
    if re.search(r'<script|javascript:|data:', content, re.I):
        return False, "Potentially unsafe HTML content detected"

    # Check for basic HTML structure
    if not re.search(r'<!DOCTYPE html>|<html', content, re.I):
        return False, "Invalid HTML format"

    return True, None

@resume.route('/resume/upload', methods=['POST'])
@login_required
def upload_resume():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        html_content = data.get('html_content')
        if not html_content:
            return jsonify({'error': 'No HTML content provided'}), 400

        # Validate content
        is_valid, error_message = validate_html_content(html_content)
        if not is_valid:
            return jsonify({'error': error_message}), 400

        # Check file size (16MB limit)
        if len(html_content.encode('utf-8')) > 16 * 1024 * 1024:
            return jsonify({'error': 'File size exceeds 16MB limit'}), 413

        resume = Resume(
            user_id=current_user.id,
            html_content=html_content
        )
        db.session.add(resume)
        db.session.commit()

        return jsonify({
            'message': 'Resume uploaded successfully',
            'id': resume.id
        }), 201
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error in resume upload: {str(e)}")
        return jsonify({'error': 'An error occurred while uploading the resume'}), 500

@resume.route('/resume/analyze', methods=['POST'])
@login_required
def analyze_resume():
    try:
        data = request.get_json()
        resume_id = data.get('resume_id')
        job_description = data.get('job_description')

        if not resume_id or not job_description:
            return jsonify({'error': 'Missing required fields'}), 400

        if len(job_description) > 50000:  # Reasonable limit for job description
            return jsonify({'error': 'Job description too long'}), 400

        resume = Resume.query.get_or_404(resume_id)

        if resume.user_id != current_user.id:
            return jsonify({'error': 'Unauthorized'}), 403

        analysis = analyze_job_description(resume.html_content, job_description)

        job_analysis = JobAnalysis(
            resume_id=resume_id,
            job_description=job_description,
            match_percentage=analysis['match_percentage'],
            matched_skills=analysis['matched_skills'],
            missing_skills=analysis['missing_skills']
        )

        db.session.add(job_analysis)
        db.session.commit()

        return jsonify(analysis), 200
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error in resume analysis: {str(e)}")
        return jsonify({'error': 'An error occurred during analysis'}), 500

@resume.route('/resume/enhance', methods=['POST'])
@login_required
def enhance_resume_route():
    try:
        data = request.get_json()
        resume_id = data.get('resume_id')
        selected_skills = data.get('selected_skills', [])

        if not resume_id:
            return jsonify({'error': 'Resume ID is required'}), 400

        if not selected_skills:
            return jsonify({'error': 'No skills selected for enhancement'}), 400

        if len(selected_skills) > 20:  # Reasonable limit for skills
            return jsonify({'error': 'Too many skills selected'}), 400

        resume = Resume.query.get_or_404(resume_id)

        if resume.user_id != current_user.id:
            return jsonify({'error': 'Unauthorized'}), 403

        enhanced_result = enhance_resume(resume.html_content, selected_skills)

        # Validate enhanced content
        is_valid, error_message = validate_html_content(enhanced_result['enhanced_content'])
        if not is_valid:
            return jsonify({'error': error_message}), 400

        # Update the resume with enhanced content
        resume.html_content = enhanced_result['enhanced_content']
        db.session.commit()

        return jsonify(enhanced_result), 200
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error in resume enhancement: {str(e)}")
        return jsonify({'error': 'An error occurred while enhancing the resume'}), 500