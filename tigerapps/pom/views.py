from django.shortcuts import render_to_response, get_object_or_404
from django.template.loader import render_to_string
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, Http404
from django.template import RequestContext
from pom.models import *
import datetime
import simplejson

def index(request, offset):
    # not used due to direct_to_template in urls.py
    return render_to_response('pom/index.html', {}, RequestContext(context))

def map_bldg_clicked(request, bldg_code):
    try:
        bldg = Building.objects.get(bldg_code=bldg_code)
        events = Building.cal_events.all(bldg)
        html = render_to_string('pom/event_info.html',
                         {'bldg_name': bldg.name,
                          'events': events})
        response_json = simplejson.dumps({'error': None,
                                          'html': html,
                                          'bldgId': bldg_code})
    except Exception, e:
        response_json = simplejson.dumps({'error': str(e)})
        
    
    return HttpResponse(response_json, content_type="application/javascript")

def date_filter_time(request, leftMonth, leftDay, leftYear, leftHour, rightMonth, rightDay, rightYear, rightHour):
    try:
        events = Building.cal_events.date_filtered(leftMonth, leftDay, leftYear, leftHour, rightMonth, rightDay, rightYear, rightHour)
        html = {'events': [(event.event_location  + "info_sep" + event.event_cluster.cluster_title + "info_sep" + event.event_date_time_start.isoformat(' ') + "info_sep" + event.event_date_time_end.isoformat(' ')) for event in events]}
        response_json = simplejson.dumps({'error': None,
                                          'html': html})
    except Exception, e:
        response_json = simplejson.dumps({'error': str(e)})
        
    
    return HttpResponse(response_json, content_type="application/javascript")
