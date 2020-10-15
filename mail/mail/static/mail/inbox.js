document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  document.querySelector('#compose-form').onsubmit = function() {
    const to = document.querySelector('#compose-recipients');
    const title = document.querySelector('#compose-subject');
    const mailBody = document.querySelector('#compose-body');

    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: to.value,
        subject: title.value,
        body: mailBody.value,
      }),
    })
    .then(response => response.json())
    .then(result => {
      console.log(result);
      load_mailbox('sent');
    })
    return false;
  };

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#viewEmail').innerHTML = "";

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      console.log(emails)
      emails.forEach(Element => {
        // Creating an HTML tag
        let emailsView = document.querySelector('#emails-view');
        let mailContainer = document.createElement('div');
        let containerDiv = document.createElement('div');
        let senderDiv = document.createElement('div');
        let titleDiv = document.createElement('div');
        let timeDiv = document.createElement('div');
        // Adding a class
        mailContainer.className = "mailContainer";
        containerDiv.className = "emailsContainer";
        senderDiv.className = "sender";
        titleDiv.className = "title";
        timeDiv.className = "timestamp";

        if (Element.read == true) {
          containerDiv.style.backgroundColor = "rgb(240, 240, 240)";
        } else {
          containerDiv.style.backgroundColor = "white";
        }

        // Changing innerHTML
        if (mailbox != "sent") {
          senderDiv.innerText = Element.sender;
        } else {
          senderDiv.innerText = Element.recipients;
        }
        titleDiv.innerText = Element.subject;
        timeDiv.innerText = Element.timestamp;

        // Putting everything in the containerDiv
        emailsView.appendChild(containerDiv);
        mailContainer.appendChild(senderDiv)
        mailContainer.appendChild(titleDiv);
        containerDiv.appendChild(mailContainer);
        containerDiv.append(timeDiv);

        // Opening the email
        containerDiv.onclick = function () {
          show_mail(Element.id);
        }

      })
    });
  
}

function show_mail(id) {

  document.querySelector("#emails-view").innerHTML = "";

  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
      // Print email
      console.log(email);

      // Creating the div
      let viewEmail = document.querySelector('#viewEmail');
      let mail = document.createElement('div');
      // Adding archive and reply buttons
      let archiveButt = document.createElement('button');
      let replyButt = document.createElement('button');
      replyButt.innerHTML = "reply";
      // Adding a class
      mail.className = "mail";
      if (email.archived == false) {
        archiveButt.innerHTML = "archive";
        archiveButt.className = "btn btn-outline-success";
      } else {
        archiveButt.innerHTML = "unarchive";
        archiveButt.className = "btn btn-outline-danger";
      }
      replyButt.className = "btn btn-outline-primary";
      

      // Adding everything in
      mail.innerHTML = `<div>
        <b>From:</b> ${email.sender} <br>
        <b>To:</b> ${email.recipients} <br>
        <b>Subject:</b> ${email.subject} <br>
        <b>Timestamp:</b> ${email.timestamp} <br>
      </div>`;
      mail.appendChild(archiveButt);
      mail.appendChild(replyButt);
      mail.append(document.createElement('hr'));
      mail.append(`${email.body}`);
      viewEmail.appendChild(mail);

      archiveButt.onclick = function () {
        
        fetch(`/emails/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
              archived: !email.archived,
          })
        })
        .then( () => {
          load_mailbox('inbox');
        });

      };
  });

  // Marking the email as read
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true,
    })
  });

}