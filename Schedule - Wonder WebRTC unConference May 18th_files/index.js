/* global $ fetch bootstrap */


// Example starter JavaScript for disabling form submissions if there are invalid fields
(function() {
  'use strict';
  window.addEventListener('load', function() {
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    var forms = document.getElementsByClassName('needs-validation');
    // Loop over them and prevent submission
    var validation = Array.prototype.filter.call(forms, function(form) {
      form.addEventListener('submit', function(event) {
        console.log('form.checkValidity()', form.checkValidity());
        if (form.checkValidity() === false) {
          event.preventDefault();
          event.stopPropagation();
          form.classList.add('validation-failed');
        } else {
          form.classList.remove('validation-failed');
        }
        form.classList.add('was-validated');
        event.preventDefault();
      }, false);
    });
  }, false);
})();

$(document).ready(function () {

  const hasNumber = (myString) => {
    return /\d/.test(myString);
  }

  let galeneServers = {
    1: 'galene-a.unrtc.co',
    2: 'galene-b.unrtc.co',
    3: 'galene-c.unrtc.co'
  }

  let sessionServerMap = {
    1: 1,
    2: 2,
    3: 3,
    4: 1,
    5: 2,
    6: 3,
    7: 1,
    8: 2,
    9: 2,
    10: 3,
    11: 1,
    12: 2,
    13: 3,
    14: 1,
    15: 2,
    16: 3,
    14: 1,
    15: 2,
    16: 3,
    17: 1,
    18: 2,
    19: 3,
    20: 1,
    21: 2,
    22: 3,
    23: 1,
    24: 2,
    25: 3,
    26: 1,
    27: 2,
    28: 3,
    29: 1,
    30: 2,
    31: 3,
    32: 1,
    33: 2,
    33: 3,
    32: 1,
    33: 2,
    34: 3,
    35: 1,
    36: 2,
    37: 3,
    38: 1,
    39: 2,
    40: 3,
    41: 1,
    42: 2,
    43: 3,
    41: 1,
    42: 2,
    43: 3,
    44: 1,
    45: 2,
    46: 3,
    47: 1,
    48: 2,
    49: 3,
    50: 1
  }

  let getServerById = (id) => {
    // console.log('getServerById > id, server', id, galeneServers[sessionServerMap[id]]);
    return galeneServers[sessionServerMap[id]];
  }

  let table = null;
  const errorModal = new bootstrap.Modal(
    document.getElementById("errorModal"),
    {}
  );

  var idColumn = 0;
  var groupColumn = 1;

  const populateSessions = () => {
    // console.log('populateSessions');
    fetch("/sessions")
      .then((response) => response.json())
      .then((data) => {
        if (table) {
          table.clear();
          table.rows.add(data).draw();
          return;
        }



        table = $("#scheduleTable").DataTable({
          responsive: true,
          data: data,
          paging: false,
          searching: false,
          bInfo: false,
          language: {
            search: "_INPUT_",
          },
          order: [[groupColumn, "asc"], [idColumn, "desc"]],
          columns: [
            { data: "id", visible: false },
            { data: "time", visible: false, className: "dragHandle dt-nowrap" },
            // { data: "name",  visible: false, className: "dt-wide-column" },
            {
              data: null,
              className: "dt-nowrap name",
              fnCreatedCell: function (nTd, sData, oData, iRow, iCol) {
                if (oData) {
                  var host = oData.host;
                  if (oData.hostlink != "" && oData.hostlink.length > 0) {
                    host = `<a href='${oData.hostlink}' target='_blank'>${oData.host}</a>`
                  }

                  var time = oData.time;

                  if((oData.time != 'Unscheduled' && hasNumber(oData.time)) && oData.duration) {
                    var startDate = moment(time, "h:mm")
                    var endDate = moment(time, "h:mm").add(oData.duration, 'minutes')
                    time = startDate.format("h:mm") + " - " + endDate.format("h:mm")
                  }

                  oData.server = getServerById(oData.id)

                  $(nTd).html(
                    `
                    <div id="session-item-${oData.id}" class='session-item ${(oData.time != 'Unscheduled' && hasNumber(oData.time)) ? "scheduled" : "unscheduled"}'>
                      <div class='header'>
                        <div class='summary'>
                          <small>${time} (${oData.duration} mins)</small>
                          <h3>${oData.name}</h3>
                          <h5>${host}</h5>
                        </div>
                      
                      </div>
                      <div class='description'>
                          ${oData.description}
                      </div>
                    </div>
                    `
                  );
                }
              },
            },
            {
              data: "host",
              visible: false,
              className: "dt-nowrap",
              fnCreatedCell: function (nTd, sData, oData, iRow, iCol) {
                if (oData.hostlink != "" && oData.hostlink.length > 0) {
                  var host = oData.hostlink;
                  $(nTd).html(
                    `<a href='${oData.hostlink}' target='_blank'>${oData.host}</a>`
                  );
                }
              },
            },
            { data: "description",
              visible: false
            },
            {
              data: "duration",
              visible: false,
              className: "dt-nowrap desc",
              render: function (value) {
                return value + " min";
              },
            }
            // {
            //   data: null,
            //   className: "dt-nowrap",
            //   defaultContent:
            //     "<button class='btn btn-success join'>Join</button><button class='btn btn-light update' data-bs-toggle='modal' data-bs-target='#updateSessionModal'>Edit</button>",
            // }
          ],
          drawCallback: function ( settings ) {
            var api = this.api();
            var rows = api.rows( {page:'current'} ).nodes();
            var last = null;

            api.column(groupColumn, {page:'current'} ).data().each( function ( group, i ) {
                if ( last !== group ) {
                    $(rows).eq( i ).before(
                        '<tr class="group"><td colspan="6">'+group+'</td></tr>'
                    );

                    last = group;
                }
            } );
          }
        });

        $(".dataTables_length").addClass("bs-select");

        // $("#scheduleTable tbody").on("hover", "tr", (event) => {});

        $("#scheduleTable tbody").on("click", "button.join", function () {
          const data = table.row($(this).parents("tr")).data();
          console.log("join: " + data.id + " > " + data.server);
          window.open(`https://${data.server}/group/session-${data.id}`);
        });

        $("#scheduleTable tbody").on("click", "button.update", function () {
          const data = table.row($(this).parents("tr")).data();
          updateModalData(data);
        });
      });
  };

  $("#submitForm").on('submit', function() {
    // console.log('submitForm > validation-failed', $("#submitForm")[0].checkValidity())
    if ($("#submitForm")[0].checkValidity() === false) {
      return;
    } else {
      const data = {
        time: "Unscheduled",
        name: $("#createSessionModal #inputSessionName").val(),
        host: $("#createSessionModal #inputHostName").val(),
        hostlink: $("#createSessionModal #inputHostLink").val() || '',
        duration: $("#createSessionModal #inputDuration").val()  || '0',
        description: $("#createSessionModal #inputDescription").val()
        // deleted: '0'
      };

      console.log('submit data', data);

      fetch("/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }).then((response) => {
        if (response.status !== 200) {
          $("#error-body").text(response.text);
          errorModal.show();
        } else {
          $('#createSessionModal').modal('hide');
          $("input, textarea").each((i, el) => {
            $(el).val("");
          });
          populateSessions();
        }

      });
    }
  });

  $("#updateForm").on('submit', function() {
    // console.log('updateForm > checkValidity', $("#updateForm")[0].checkValidity())
    if ($("#updateForm")[0].checkValidity() === false) {
      return;
    } else {
      const data = {
        id: parseInt($("#updateSessionModal #updateSessionId").val()),
        time: $("#updateSessionModal #updateSessionTime").val() || "Unscheduled",
        name: $("#updateSessionModal #updateSessionName").val(),
        host: $("#updateSessionModal #updateHostName").val(),
        hostlink: $("#updateSessionModal #updateHostLink").val() || '',
        duration: $("#updateSessionModal #updateDuration").val() || '0',
        description: $("#updateSessionModal #updateDescription").val()
        // deleted: $("#updateSessionModal #updateDeleted").val() || 0,
      };

      console.log('update data', data);

      fetch("/session", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }).then((response) => {
        if (response.status !== 200) {
          response.text().then((text) => {
            $("#error-body").text(text);
            errorModal.show();
          });
        } else {
          $('#updateSessionModal').modal('hide');
          $("input, textarea").each((i, el) => {
            $(el).val("");
          });
          populateSessions();
        }


    });
  }
  });

  const updateModalData = (data) => {
    $("#updateSessionModal #updateSessionId").val(Number(data.id));
    $("#updateSessionModal #updateSessionName").val(data.name);
    $("#updateSessionModal #updateHostName").val(data.host);
    $("#updateSessionModal #updateHostLink").val(data.hostlink);
    $("#updateSessionModal #updateDescription").val(data.description);
    $("#updateSessionModal #updateDuration").val(data.duration);
    $("#updateSessionModal #updateSessionTime").val(data.time);
    // $("#updateSessionModal #updateDeleted").val(data.deleted);
  };


  populateSessions();
});
