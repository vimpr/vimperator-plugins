// Vimperator Plugin: Param Editor
// Version: 0.1

(function (){
    var doc = null;

    var xpath = function(query, node){
        var snap = doc.evaluate(query, node, null,
            XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        var res = [];
        for(let i = 0, l = snap.snapshotLength; i < l; i++){
            res.push(snap.snapshotItem(i));
        }
        return res;
    };

    var Form = function(form, i){
        this.uid = i;
        this.method = (form.method.length) ? form.method.toUpperCase() : "GET";
        this.action = form.action;
        this.name = (form.name.length) ? form.name : this.uid;
        this.e = form;
        this.member = [];

        //var elems = xpath("descendant::*[@name]", form);
        var elems = Array.slice(form.elements);
        var count = 0;
        elems.forEach(function(e, i){
            if(!e.type) return;
            var type = e.type.toLowerCase();
            if(type == "radio" || type == "checkbox"){
                let mg = null;
                for(let i = 0, l = this.member.length; i < l; i++){
                    if(this.member[i].constructor == FormMemberGroup &&
                       this.member[i].name == e.name){
                        mg = this.member[i];
                        break;
                    }
                }
                if(!mg){
                    mg = new FormMemberGroup(e, count++);
                    this.member.push(mg);
                }
                mg.add_elem(e);
            }else{
                this.member.push(new FormMember(e, count++));
            }
        }, this);

        this.html = form2html(this);
    };

    var FormMember = function(elem, i){
        this.uid = i;
        this.elem = elem;
    };

    ["name", "value", "type"].forEach(function(n){
        FormMember.prototype.__defineGetter__(n, function(){
            return this.elem[n];
        });

        FormMember.prototype.__defineSetter__(n, function(v){
            this.elem[n] = v;
        });
    });

    var FormMemberGroup = function(e, i){
        this.uid = i;
        this.type = e.type.toLowerCase();
        this.name = e.name;
        this.elems = [];
    };

    FormMemberGroup.prototype.__defineGetter__("value", function(){
        var v = [];
        this.elems.forEach(function(e){
            var _v = e.value;
            if(e.checked){
                _v = "[" + _v + "]";
            }
            v.push(_v);
        });
        return v.join(" ");
    });

    FormMemberGroup.prototype.__defineSetter__("value", function(v){
        var check = function(n){
            if(this.type == "radio"){
                this.elems[n].checked = true;
            }else if(this.type == "checkbox"){
                this.elems[n].checked = (this.elems[n].checked) ? false : true;
            }
        };

        for(let i = 0, l = this.elems.length; i < l; i++){
            if(this.elems[i].value == v){
                check.call(this, i);
                return;
            }
        }
        if(this.elems[v]){
            check.call(this, v);
        }
    });

    FormMemberGroup.prototype.add_elem = function(e){
        this.elems.push(e);
    };

    var form2html = function(form){
        var html = [
            '<style type="text/css">',
                '.red { color:#c00 !important}',
                '.blue { color:#00c !important}',
                'caption { margin:5px 0; text-align:left; font-weight:bold !important;}',
                'th { padding:0 7px; text-align:left; font-weight:bold !important;}',
                'td { padding:0 7px;}',
            '</style>',
            '<table style="width:100%;">',
                '<caption><span class="blue">' + form.method + '</span> name:<span class="red">' + form.name + '</span> =>' + form.action + '</caption>',
                '<tr><th style="width:15%;"> Name</th><th style="width:15%;"> Type</th><th> Value</th></tr>'];

        form.member.forEach(function(e){
            var uid = (e.uid < 10) ? e.uid + " " : e.uid;
            html.push('<tr><td>'+ uid + ' ' + e.name + '</td><td>| ' + e.type + '</td><td>| ' + e.value + '</td></tr>');
        });

        html.push(
            '</table>'
        );

        return html.join('');
    };

    var get_forms = function(){
        var r = [];
        var f = doc.forms;
        for(let i = 0, l = f.length; i < l; i++){
            r.push(new Form(f[i], i));
        }
        return r;
    };

    var select = function(a, q){
        var cand = [];
        for(let i = 0, l = a.length; i < l; i++){
            if(a[i].name == q || a[i].uid == q){
                cand.push(a[i]);
                break;
            }else if(new RegExp("^"+q).test(a[i].name)){
                cand.push(a[i]);
            }
        }
        if(cand.length == 1){
            return cand[0];
        }else{
            return null;
        }
    };

    liberator.commands.addUserCommand(
        ["pls"],
        "Listing current value of forms",
        function(q){
            doc = window.content.document;
            var forms = get_forms();

            var html = null;
            if(q){
                let form = select(forms, q);
                if(form) html = form.html;
            }else if(forms.length){
                html = "";
                forms.forEach(function(f){
                    html += f.html;
                    html += "<br/>";
                });
            }

            if(html){
                liberator.commandline.echo(html,
                    liberator.commandline.HL_NORMAL, liberator.commandline.FORCE_MULTILINE);
            }else{
                liberator.echoerr("Form not found");
            }

            /*
            forms.forEach(function(f){
                liberator.log(f, 9);
                f.member.forEach(function(m){
                    liberator.log(m, 9);
                });
            });
            */
            window.content.vimp_param_editor_forms = forms;
        },
        null, true
    );

    liberator.commands.addUserCommand(
        ["pe[dit]"],
        "Edit value of a form element",
        function(q, submit){
            var _ = q.match(/^\s*([^.\s]+)\.([^=\s]+)\s*=\s*(.*)$/);
            if(!_){
                liberator.echoerr("Failed to parse query");
                return;
            }
            var [, f, m, v] = _;
            //liberator.log([f, m, v], 9);

            doc = window.content.document;
            var forms = window.content.vimp_param_editor_forms || get_forms();
            var form = select(forms, f);
            if(form == null){
                liberator.echoerr("Form not found");
                return;
            }
            //liberator.log(form, 9);

            var mem = select(form.member, m);
            if(mem == null){
                liberator.echoerr("FormMember not found");
                return;
            }
            //liberator.log(mem, 9);

            mem.value = v;

            if(submit){
                form.e.submit();
            }
        },
        null, true
    );

})();
