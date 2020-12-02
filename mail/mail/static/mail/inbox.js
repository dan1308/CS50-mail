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
  document.querySelector('#viewEmail').innerHTML = '';

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
        let senderDiv = document.createElement('span');
        let titleDiv = document.createElement('span');
        let timeDiv = document.createElement('span');
        // Adding a class
        mailContainer.className = "mailContainer";
        containerDiv.className = "emailsContainer";
        senderDiv.className = "sender";
        titleDiv.className = "title";
        timeDiv.className = "timestamp";

        // Changing innerHTML
        if (mailbox == "sent") {
          senderDiv.innerText = "Me";
        } else {
          senderDiv.innerText = Element.recipients;

          if (Element.read == true) {
            mailContainer.style.backgroundColor = "rgb(240, 240, 240)";
          } else {
            mailContainer.style.backgroundColor = "white";
          }
        }
        titleDiv.innerText = Element.subject;
        timeDiv.innerText = Element.timestamp;

        // Putting everything in the containerDiv
        mailContainer.appendChild(senderDiv)
        mailContainer.appendChild(titleDiv);
        mailContainer.append(timeDiv);
        emailsView.appendChild(mailContainer);

        // Opening the email
        mailContainer.onclick = function () {
          show_mail(Element.id, mailbox);
        }

      })
    });
  
}

function show_mail(id, mailbox) {

  document.querySelector("#emails-view").innerHTML = "";

  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
      // Print email
      console.log(email);

      // Creating the div
      let viewEmail = document.querySelector('#viewEmail');
      let mail = document.createElement('div');

      // Adding everything in
      mail.innerHTML = `<div>
        <h4>${email.subject}</h4>
        <b>From:</b> ${email.sender} <br>
        <b>To:</b> ${email.recipients} <br>
        <b>Timestamp:</b> ${email.timestamp} <br><br>
      </div>`;

      if (mailbox != "sent") {
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
        mail.appendChild(archiveButt);
        mail.appendChild(replyButt);

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

        replyButt.onclick = function() {
          reply(email.sender, email.subject, email.timestamp, email.body);
        }

      }
      
      let emailBody = document.createElement('div');
      emailBody.className = "emailBody";
      emailBody.innerHTML = `${email.body}`;

      mail.append(document.createElement('hr'));
      mail.append(emailBody);
      viewEmail.appendChild(mail);

  });

  // Marking the email as read
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true,
    })
  });

}

function reply(recipient, subject, timestamp, body) {
  compose_email();

  if (!/Re:/g.test(subject)) subject = `Re: ${subject}`;

  document.querySelector('#compose-recipients').value = recipient;
  document.querySelector('#compose-subject').value = subject;
  document.querySelector('#compose-body').value = `\n-------\nOn ${timestamp} ${recipient} wrote: \n${body}\n`;
}