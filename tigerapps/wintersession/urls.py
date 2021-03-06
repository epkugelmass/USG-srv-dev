from django.conf.urls.defaults import patterns, url, include
from django.contrib import admin
from wintersession import views

admin.autodiscover()

urlpatterns = patterns('',
    url(r'^enroll/$', views.enroll, name='enroll'),
    url(r'^student/$', views.student, name='student'),
    url(r'^courses/$', views.courses, name='courses'),
    url(r'^instructor/$', views.instructor, name='instructor'),
    url(r'^instructor/attendance$', views.instructor, name='attendance'),
    url(r'^student/drop/$', views.drop, name='drop'),
    url(r'^student/add/$', views.add, name='add'),
    url(r'^teach/$', views.teach, name='teach'),
    url(r'^about/$', views.about, name='about'),
    url(r'^$', views.home, name='home'),
    
    url(r'^admin/?$', 'django_cas.views.login', kwargs={'next_page': '/djadmin/'}),
    (r'^djadmin/', include(admin.site.urls)),
    
    # login/logout
    url(r'^login/?$', 'django_cas.views.login', name='login'),
    url(r'^logout/?$', 'django_cas.views.logout', name='logout'),
)
