//profile settings for admin
//all of what an admin user only can access
function renderProfileMenu(user) {
  const adminSection = document.getElementById('profile-admin');
  const adminList = document.getElementById('profile-admin-links');

  try {
    if (!user || typeof user.name !== 'string') {
      throw new Error('Invalid user data');
    }

    document.querySelector('.profile-name').textContent = user.name;
    document.querySelector('.profile-role').textContent = user.role ?? '';

    adminList.replaceChildren();
    const orgs = Array.isArray(user.adminOf) ? user.adminOf : [];
    adminSection.hidden = orgs.length === 0;

    orgs.forEach(org => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `create-event.html?org=${encodeURIComponent(org.id)}`;
      a.textContent = orgs.length === 1 ? 'Create Event' : `Create Event: ${org.name}`;
      li.append(a);
      adminList.append(li);
    });
  } catch (err) {
    console.error('Could not render profile menu:', err);
    if (adminSection) adminSection.hidden = true;   // fail closed
    if (adminList) adminList.replaceChildren();
  }
}